const express = require('express');
const { scanCommand } = require('./scan');
const { loadConfig } = require('../lib/config');
const { loadExistingTodos } = require('../lib/todos');

function buildTodoTree(todos) {
  const todoMap = new Map(todos.map(todo => [todo.id, { ...todo, children: [] }]));
  const roots = [];

  for (const todo of todoMap.values()) {
    if (todo.parentId) {
      const parent = todoMap.get(todo.parentId);
      if (parent) {
        parent.children.push(todo);
      }
    } else {
      roots.push(todo);
    }
  }

  return roots;
}

function renderTodoTree(todos, level = 0) {
  const indent = '  '.repeat(level);
  let html = '';
  
  for (const todo of todos) {
    const status = todo.completed ? '✓' : '○';
    html += `${indent}<div class="todo-item level-${level}">
      <span class="status">${status}</span>
      <span class="id">#${todo.id}</span>
      <span class="body">${todo.body}</span>
      <span class="file">${todo.file}:${todo.line}</span>
    </div>\n`;
    
    if (todo.children.length > 0) {
      html += renderTodoTree(todo.children, level + 1);
    }
  }
  
  return html;
}

async function serveCommand(dir) {
  try {
    // Initial scan
    await scanCommand(dir);
    
    const app = express();
    const config = await loadConfig(dir);
    const port = config.port || 3000;
    
    app.get('/', async (req, res) => {
      const todos = await loadExistingTodos(config.outputFile);
      const todoTree = buildTodoTree(todos);
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PDD Todos</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 2rem;
              line-height: 1.5;
            }
            .todo-item {
              margin: 0.5rem 0;
              padding: 0.5rem;
              border-radius: 4px;
              background: #f5f5f5;
            }
            .todo-item:hover {
              background: #eee;
            }
            .status {
              color: #666;
              margin-right: 0.5rem;
            }
            .id {
              color: #0066cc;
              margin-right: 1rem;
            }
            .file {
              color: #666;
              font-size: 0.9em;
              margin-left: 1rem;
            }
            .level-1 { margin-left: 2rem; }
            .level-2 { margin-left: 4rem; }
            .level-3 { margin-left: 6rem; }
            .level-4 { margin-left: 8rem; }
          </style>
        </head>
        <body>
          <h1>PDD Todos</h1>
          ${renderTodoTree(todoTree)}
        </body>
        </html>
      `);
    });
    
    app.listen(port, () => {
      console.log(`PDD web interface running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { serveCommand };
