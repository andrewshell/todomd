const cli = require('nodemon/lib/cli');
const config = require('nodemon/lib/config');
const nodemon = require('nodemon');
const options = cli.parse(process.argv);

function nodemonOptions() {
  return new Promise((resolve, reject) => {
    config.load(options, (config) => {
      resolve({
        cwd: config.system.cwd,
        ext: config.options.execOptions.ext,
        monitor: config.options.monitor,
      });
    });
  });
}

module.exports = { nodemonOptions };
