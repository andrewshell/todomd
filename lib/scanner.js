const fs = require('fs').promises;
const path = require('path');

const patterns = {
  singleLine: /\/\/\s*@todo(?:\s+#(\d+))?\s*:?(.*$)/i,
  multiLineStart: /\/\*\s*@todo(?:\s+#(\d+))?\s*:?(.*)/i,
  multiLineContent: /\s*\*\s*(.*)/,
  multiLineEnd: /\s*\*\/(.*)/
};

async function scanFile(filePath, existingTodos, nextId) {
  const todos = [];
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  
  let inMultilineComment = false;
  let currentTodo = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!inMultilineComment) {
      const singleMatch = line.match(patterns.singleLine);
      if (singleMatch) {
        const parentId = singleMatch[1] ? parseInt(singleMatch[1]) : null;
        const body = singleMatch[2].trim();
        const existingTodo = existingTodos.find(t => t.body === body && t.parentId === parentId);
        todos.push({
          id: existingTodo ? existingTodo.id : nextId(),
          body,
          parentId,
          file: filePath,
          line: i + 1
        });
        continue;
      }
      
      const multiStart = line.match(patterns.multiLineStart);
      if (multiStart) {
        inMultilineComment = true;
        currentTodo = {
          parentId: multiStart[1] ? parseInt(multiStart[1]) : null,
          body: multiStart[2].trim(),
          file: filePath,
          line: i + 1
        };
        continue;
      }
    } else {
      if (line.match(patterns.multiLineEnd)) {
        if (currentTodo) {
          const existingTodo = existingTodos.find(t => 
            t.body === currentTodo.body && 
            t.parentId === currentTodo.parentId
          );
          todos.push({
            id: existingTodo ? existingTodo.id : nextId(),
            ...currentTodo
          });
        }
        inMultilineComment = false;
        currentTodo = null;
      } else {
        const contentMatch = line.match(patterns.multiLineContent);
        if (contentMatch && contentMatch[1].trim() && currentTodo) {
          currentTodo.body += ' ' + contentMatch[1].trim();
        }
      }
    }
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
