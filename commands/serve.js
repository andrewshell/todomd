const express = require('express');
const path = require('path');
const { scanCommand } = require('./scan');
const { loadTodos, getFileSnippet } = require('../lib/todos');
const { loadConfig } = require('../lib/config');

function formatFile(todo) {
  if (!todo.file) return '';
  const line = todo.line ? `:${todo.line}` : '';
  return `<div class="todo-file">${todo.file}${line}</div>`;
}

function formatTodo(todo, todos, level = 0) {
  const children = todos.filter(t => t.parentId === todo.id);
  const completed = todo.completed ? 'completed' : '';
  
  return `
    <div class="todo ${completed}" style="margin-left: ${level}rem">
      <a href="/todo/${todo.id}" class="todo-link">
        <span class="todo-id">#${todo.id}</span>
        ${todo.body}
      </a>
      ${formatFile(todo)}
    </div>
    ${children.map(child => formatTodo(child, todos, level + 1)).join('')}
  `;
}

async function renderTodoPage(todo, todos) {
  const children = todos.filter(t => t.parentId === todo.id);
  const childrenHtml = children.length ? `
    <div class="children">
      <h2>Child Tasks</h2>
      ${children.map(child => formatTodo(child, todos, 0)).join('')}
    </div>
  ` : '';

  const snippet = await getFileSnippet(todo.file, todo.line);
  const snippetHtml = snippet ? `
    <div class="code-snippet">
      <pre><code>${snippet.map(line => 
        `<div class="code-line${line.highlight ? ' highlight' : ''}">` +
        `<span class="line-number">${line.number}</span>` +
        `<span class="line-content">${escapeHtml(line.content)}</span>` +
        '</div>'
      ).join('')}</code></pre>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TODO #${todo.id}</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <h1><span class="todo-id">#${todo.id}</span> ${todo.body}</h1>
        ${formatFile(todo)}
        ${snippetHtml}
        ${childrenHtml}
        <p><a href="/">Back to All TODOs</a></p>
      </body>
    </html>
  `;
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderHomePage(todos) {
  const rootTodos = todos.filter(t => !t.parentId);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TODOs</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <h1>TODOs</h1>
        ${rootTodos.map(todo => formatTodo(todo, todos, 0)).join('')}
      </body>
    </html>
  `;
}

async function serve(dir) {
  const { todos, ...config } = await loadConfig(dir);
  const app = express();
  const port = config.port || 3000;

  // Serve the CSS file
  app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../lib/styles.css'));
  });

  app.get('/', (req, res) => {
    res.send(renderHomePage(todos));
  });

  app.get('/todo/:id', async (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) {
      res.status(404).send('TODO not found');
      return;
    }
    const html = await renderTodoPage(todo, todos);
    res.send(html);
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

async function serveCommand(dir, options = {}) {
  try {
    await scanCommand(dir);
    await serve(dir);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

module.exports = { serveCommand };
