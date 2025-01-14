const fs = require('fs').promises;
const path = require('path');
const markdown = require('./markdown');
const { nodemonOptions } = require('./nodemon');

const defaultConfig = {
  cwd: process.cwd(),
  ext: 'js,jsx,ts,tsx,vue',
  monitor: path.resolve(process.cwd(), '**', '*'),
  todos: [],
  port: process.env.PORT ?? 3000,
};

async function loadConfig() {
  let config = {};

  try {
    config = { ...defaultConfig, ...await nodemonOptions() };
  } catch (error) {
    console.error('Error loading nodemon config', error);
  }

  config.patterns = config.monitor.map(pattern => {
    // Add extension filter to included paths
    if (!pattern.startsWith('!')) {
      const extensions = config.ext.split(',').map(ext => `*.${ext}`);
      return extensions.map(ext => pattern.replace(/\*\*\/\*/g, `**/${ext}`));
    }
    return pattern; // Keep exclusion patterns as is
  }).flat();

  try {
    const todoFile = await fs.readFile('todo.md', 'utf8');
    config.todos = markdown.unserialize(todoFile ?? '');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(error);
    }
  }

  return config;
}

async function saveConfig(config) {
  const todoFile = '# TODOs\n\n' + markdown.serialize(config.todos ?? []).trim();
  await fs.writeFile('todo.md', todoFile, 'utf8');
}

module.exports = { loadConfig, saveConfig };
