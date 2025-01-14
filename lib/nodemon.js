const cli = require('nodemon/lib/cli');
const config = require('nodemon/lib/config');

const options = cli.parse(process.argv);

function nodemonOptions() {
  return new Promise((resolve) => {
    config.load(options, (c) => {
      resolve({
        cwd: c.system.cwd,
        ext: c.options.execOptions.ext,
        monitor: c.options.monitor,
      });
    });
  });
}

module.exports = { nodemonOptions };
