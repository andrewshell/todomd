const { loadConfig, saveConfig } = require('../lib/config');
const { scanDirectory } = require('../lib/scanner');

async function scanCommand(dir) {
  process.chdir(dir);

  try {
    const config = await loadConfig();
    config.todos = config.todos.concat(await scanDirectory(config));
    await saveConfig(config);
    console.log(`Found ${config.todos.length} TODOs.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { scanCommand };
