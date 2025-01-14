#!/usr/bin/env node

const { program } = require('commander');
const { scanCommand } = require('../commands/scan');
const { serveCommand } = require('../commands/serve');

program
  .name('todomd')
  .description('@TODO comments CLI tool')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan directory for @TODO comments')
  .argument('[dir]', 'directory to scan', '.')
  .action(scanCommand);

program
  .command('serve')
  .description('Start web interface to view todos')
  .argument('[dir]', 'directory to serve from', '.')
  .action(serveCommand);

// Make "scan" the default command
program
  .arguments('[dir]')
  .action((dir = '.') => {
    scanCommand(dir);
  });

program.parse();
