const fs = require('fs').promises;
const { loadConfig, saveConfig } = require('../lib/config');
const { loadTodos, getNextId } = require('../lib/todos');
const { scanDirectory } = require('../lib/scanner');

async function scanCommand(dir) {
  try {
    const config = await loadConfig(dir);
    let nextIdCounter = getNextId(config.todos);
    const nextId = () => nextIdCounter++;
    
    const scannedTodos = await scanDirectory(dir, config, config.todos, nextId);

    // Process removed todos
    const finalTodos = scannedTodos.slice();
    for (const existingTodo of config.todos) {
      const stillExists = scannedTodos.some(t => t.id === existingTodo.id);
      if (!stillExists) {
        // Keep todo but mark as completed
        finalTodos.push({
          ...existingTodo,
          completed: true,
          file: null,
          line: null,
        });
      }
    }

    config.todos = finalTodos;

    await saveConfig(dir, config);
    console.log(`Found ${finalTodos.length} TODOs.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { scanCommand };
