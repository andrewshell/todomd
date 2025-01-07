const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { defaultConfig } = require('../lib/config');

async function initCommand(dir = '.') {
  const configPath = path.join(dir, 'pdd.yml');

  try {
    let existingConfig = {};
    try {
      const configFile = await fs.readFile(configPath, 'utf8');
      existingConfig = yaml.load(configFile);
    } catch (err) {
      // File doesn't exist or can't be read, use empty config
    }

    const mergedConfig = { ...defaultConfig, ...existingConfig };
    await fs.writeFile(configPath, yaml.dump(mergedConfig));
    console.log('Config file updated at:', configPath);
  } catch (error) {
    console.error('Error updating config file:', error);
  }
}

module.exports = { initCommand };
