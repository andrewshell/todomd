const fs = require('fs').promises;

async function loadExistingTodos(outputFile) {
  try {
    const content = await fs.readFile(outputFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

function getNextId(existingTodos) {
  if (existingTodos.length === 0) return 1;
  return Math.max(...existingTodos.map(todo => todo.id)) + 1;
}

module.exports = { loadExistingTodos, getNextId };
