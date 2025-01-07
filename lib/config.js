const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const defaultConfig = {
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.php', '.py', '.rb', '.java', '.cs', '.go'],
  ignore: ['node_modules', '.git', 'dist', 'build'],
  outputFile: 'todo.json',
  port: 3000
};

async function loadConfig(dir) {
  try {
    const configPath = path.join(dir, 'pdd.yml');
    const configFile = await fs.readFile(configPath, 'utf8');
    return { ...defaultConfig, ...yaml.load(configFile) };
  } catch (error) {
    return defaultConfig;
  }
}

module.exports = { defaultConfig, loadConfig };
