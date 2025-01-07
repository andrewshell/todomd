const fs = require('fs').promises;
const path = require('path');
const { defaultConfig } = require('../lib/config');

async function initCommand(dir = '.') {
  const configPath = path.join(dir, 'pdd.yml');
  
  try {
    const exists = await fs.access(configPath).then(() => true).catch(() => false);
    if (exists) {
      console.log('Config file already exists at:', configPath);
      return;
    }

    const configContent = `# Puzzle Driven Development Configuration
extensions:
${defaultConfig.extensions.map(ext => `  - "${ext}"`).join('\n')}

ignore:
${defaultConfig.ignore.map(i => `  - "${i}"`).join('\n')}

outputFile: "${defaultConfig.outputFile}"
`;

    await fs.writeFile(configPath, configContent);
    console.log('Created config file at:', configPath);
  } catch (error) {
    console.error('Error creating config file:', error);
  }
}

module.exports = { initCommand };
