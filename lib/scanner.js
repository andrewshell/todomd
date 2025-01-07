const fs = require('fs').promises;
const path = require('path');

// Simplified pattern to just detect @todo
const TODO_PATTERN = /\s@todo(?:\s+#(\d+))?\s*(.*$)/i;

async function scanFile(filePath, existingTodos, nextId) {
  const todos = [];
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  
  let currentTodo = null;
  let startLine = null;
  let prefix = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!currentTodo) {
      // Look for new TODO
      const todoMatch = line.match(TODO_PATTERN);
      if (todoMatch) {
        // Extract the prefix (everything before @todo)
        prefix = line.substring(0, todoMatch.index);
        const parentId = todoMatch[1] ? parseInt(todoMatch[1]) : null;
        const body = todoMatch[2].trim();
        
        currentTodo = {
          parentId,
          body,
          file: filePath
        };
        startLine = i + 1;
      }
    } else {
      // Check if the next line continues the TODO
      // It should start with the same prefix plus one space
      const expectedPrefix = prefix + ' ';
      if (line.startsWith(expectedPrefix)) {
        // Add the content after the prefix to the todo body
        const content = line.substring(expectedPrefix.length).trim();
        if (content) {
          currentTodo.body += ' ' + content;
        }
      } else {
        // TODO has ended - save it
        const existingTodo = existingTodos.find(t =>
          t.body === currentTodo.body &&
          t.parentId === currentTodo.parentId
        );
        
        todos.push({
          id: existingTodo ? existingTodo.id : nextId(),
          ...currentTodo,
          line: startLine === i ? 
            `${startLine}` : // Single line
            `${startLine}-${i}` // Multiline
        });
        
        currentTodo = null;
        prefix = null;
        
        // Check if this line starts a new TODO
        const todoMatch = line.match(TODO_PATTERN);
        if (todoMatch) {
          prefix = line.substring(0, todoMatch.index);
          const parentId = todoMatch[1] ? parseInt(todoMatch[1]) : null;
          const body = todoMatch[2].trim();
          
          currentTodo = {
            parentId,
            body,
            file: filePath
          };
          startLine = i + 1;
        }
      }
    }
  }
  
  // If we have an unfinished TODO at the end of file, save it
  if (currentTodo) {
    const existingTodo = existingTodos.find(t =>
      t.body === currentTodo.body &&
      t.parentId === currentTodo.parentId
    );
    
    todos.push({
      id: existingTodo ? existingTodo.id : nextId(),
      ...currentTodo,
      line: currentTodo.body.includes(' ') ? 
        `${startLine}-${lines.length}` : // Multiline
        startLine // Single line
    });
  }

  return todos;
}

async function scanDirectory(dir, config, existingTodos, nextId) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let todos = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!config.ignore.includes(entry.name)) {
        todos = todos.concat(await scanDirectory(fullPath, config, existingTodos, nextId));
      }
    } else if (entry.isFile() && config.extensions.includes(path.extname(entry.name))) {
      todos = todos.concat(await scanFile(fullPath, existingTodos, nextId));
    }
  }

  return todos;
}

module.exports = { scanDirectory, scanFile };
