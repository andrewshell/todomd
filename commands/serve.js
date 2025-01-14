const express = require('express');
const path = require('path');
const { getFileSnippet } = require('../lib/todos');
const { loadConfig, saveConfig } = require('../lib/config');
const { scanDirectory } = require('../lib/scanner');

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatSnippet(id, snippet) {
  return snippet ? `
    <div class="code-snippet" style="display:none" id="${id}">
      <pre><code>${snippet.map((line) => `<div class="code-line${line.highlight ? ' highlight' : ''}">`
        + `<span class="line-number">${line.number}</span>`
        + `<span class="line-content">${escapeHtml(line.content)}</span>`
        + '</div>').join('')}</code></pre>
    </div>
  ` : '';
}

async function formatFile(todo) {
  if (!todo.file || !todo.line) return '';
  const id = `todo-${todo.file}:${todo.line}`.replaceAll(/[^a-z0-9]+/gi, '-');
  const snippet = await getFileSnippet(todo.file, todo.line);
  return `
    <div class="todo-file" onclick="toggle('${id}')">${todo.file}${todo.line}</div>
    ${formatSnippet(id, snippet)}
  `;
}

async function formatTodo(todo) {
  const file = await formatFile(todo);
  return `
    <div class="todo">
      ${todo.body}
      ${file}
    </div>
  `;
}

async function renderHomePage(todos) {
  const renderedTodos = await Promise.all(todos.map(formatTodo));
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TODOs</title>
        <link rel="stylesheet" href="/styles.css">
        <script type="text/javascript">
          function toggle(id) {
            const todo = document.getElementById(id);
            if (todo) { // Check if the element exists
              // Toggle the display property
              if (todo.style.display === "none" || !todo.style.display) {
                todo.style.display = "block";
              } else {
                todo.style.display = "none";
              }
            }
          }
        </script>
      </head>
      <body>
        <h1>TODOs</h1>
        ${renderedTodos.join('\n')}
      </body>
    </html>
  `;
}

async function serve() {
  const config = await loadConfig();

  const app = express();
  const port = config.port || 3000;

  // Serve the CSS file
  app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../lib/styles.css'));
  });

  app.get('/', async (req, res) => {
    config.todos = config.todos.concat(await scanDirectory(config));
    saveConfig(config);

    const html = await renderHomePage(config.todos);
    res.send(html);
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

async function serveCommand(dir) {
  try {
    process.chdir(dir);
    await serve();
  } catch (error) {
    console.error(error);
  }
}

module.exports = { serveCommand };
