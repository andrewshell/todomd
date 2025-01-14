#!/usr/bin/env node

const { program } = require('commander');
const { scanCommand } = require('../commands/scan');
const { initCommand } = require('../commands/init');
const { serveCommand } = require('../commands/serve');

program
  .name('todo')
  .description('@TODO comments CLI tool')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan directory for @TODO comments')
  .argument('[dir]', 'directory to scan', '.')
  .action(scanCommand);

program
  .command('init')
  .description('Initialize todo.md configuration file')
  .argument('[dir]', 'directory to create config in', '.')
  .action(initCommand);

program
  .command('serve')
  .description('Start web interface to view todos')
  .argument('[dir]', 'directory to serve from', '.')
  .action(serveCommand);

program.parse();
