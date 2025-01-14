const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const markdown = require('./markdown');

const defaultConfig = {
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
  ignore: ['node_modules', '.git', 'dist', 'build'],
  port: 3000,
};

function dumpYaml(mergedConfig) {
  return yaml.dump(mergedConfig, { flowLevel: 1 });
}

function loadYaml(yamlString) {
  return { ...defaultConfig, ...yaml.load(yamlString) };
}

async function loadConfig(dir) {
  try {
    const configPath = path.join(dir, 'todo.md');
    const configFile = await fs.readFile(configPath, 'utf8');
    const configParts = configFile.split('---\n', 3);

    const yamlString = configParts[1]
    const config = loadYaml(yamlString);

    config.todos = markdown.unserialize(configParts[2] ?? '');

    return config;
  } catch (error) {
    console.error(error);
    return { ...defaultConfig, todos: [] };
  }
}

async function saveConfig(dir, config) {
  const configPath = path.join(dir, 'todo.md');

  const { todos, ...front } = config;
  const yamlString = dumpYaml(front || defaultConfig).trim();
  const mdBody = markdown.serialize(todos ?? []).trim();

  const configFile = `---\n${yamlString}\n---\n${mdBody}`.trim() + '\n';

  await fs.writeFile(configPath, configFile, 'utf8');
}

module.exports = { loadConfig, saveConfig };
