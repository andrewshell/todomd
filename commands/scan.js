const fs = require('fs').promises;
const { loadConfig } = require('../lib/config');
const { loadExistingTodos, getNextId } = require('../lib/todos');
const { scanDirectory } = require('../lib/scanner');

async function scanCommand(dir) {
  try {
    const config = await loadConfig(dir);
    const existingTodos = await loadExistingTodos(config.outputFile);
    let nextIdCounter = getNextId(existingTodos);
    const nextId = () => nextIdCounter++;
    
    const scannedTodos = await scanDirectory(dir, config, existingTodos, nextId);

    // Process removed todos
    const finalTodos = scannedTodos.slice();
    for (const existingTodo of existingTodos) {
      const stillExists = scannedTodos.some(t => t.id === existingTodo.id);
      if (!stillExists) {
        const hasChildren = scannedTodos.some(t => t.parentId === existingTodo.id);
        if (hasChildren) {
          // Keep todo but mark as completed
          finalTodos.push({
            ...existingTodo,
            completed: true
          });
        }
        // If no children, todo is dropped completely
      }
    }

    await fs.writeFile(config.outputFile, JSON.stringify(finalTodos, null, 2));
    console.log(`Found ${finalTodos.length} TODOs. Results saved to ${config.outputFile}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { scanCommand };
