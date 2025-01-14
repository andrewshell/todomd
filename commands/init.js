const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { loadConfig, saveConfig } = require('../lib/config');

async function initCommand(dir = '.') {
  try {
    let config = {};
    try {
      config = await loadConfig(dir);
    } catch (error) {
      // File doesn't exist or can't be read, use empty config
    }
    await saveConfig(dir, config);
    console.log('Config file updated in:', dir);
  } catch (error) {
    console.error('Error updating config file:', error);
  }
}

module.exports = { initCommand };
