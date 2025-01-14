const fs = require('fs').promises;
const fg = require('fast-glob');
const path = require('path');

// Simplified pattern to just detect @todo
const TODO_PATTERN = /\s@?todo:?\s*(.*$)/i;

async function scanFile(filePath) {
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
        prefix = line.substring(0, todoMatch.index + 1);
        const body = todoMatch[1].trim();
        
        currentTodo = {
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
        todos.push({
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
          const body = todoMatch[1].trim();
          
          currentTodo = {
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
    todos.push({
      ...currentTodo,
      line: currentTodo.body.includes(' ') ? 
        `${startLine}-${lines.length}` : // Multiline
        startLine // Single line
    });
  }

  return todos;
}

async function scanDirectory(config) {
  let todos = [];

  // Fetch matching filenames
  const entries = await fg(config.patterns, { dot: true }); // `dot: true` includes hidden files

  for (const fullPath of entries) {
    todos = todos.concat(await scanFile(
      path.relative(config.cwd, fullPath)
    ));
  }

  return todos;
}

module.exports = { scanDirectory, scanFile };
