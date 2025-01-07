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
    const status = todo.completed ? 'complete' : 'incomplete';
    html += `${indent}<div class="todo-item level-${level} ${status}" style="margin-left: ${level}rem;">
      <span class="id">#${todo.id}</span>
      <span class="file">${todo.file}:${todo.line}</span>
      <span class="body">${todo.body}</span>
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
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .todo-item:hover {
              background: #eee;
            }
            .complete {
              text-decoration: line-through;
            }
            .id {
              color: #0066cc;
              margin-right: 0.5rem;
            }
            .file {
              color: #666;
              font-size: 0.9em;
              margin-right: 0.5rem;
            }
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
