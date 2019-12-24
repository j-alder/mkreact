import { exit } from './error';

/*
CLI flow
ffs <project-name> [args] [/path/to/directory] 
  args:
    --framework: react, vue, angular
    --bundler: *webpack, browserify, rollup
    -c, --configure: true, *false
    -v, --verbose: true, *false
with args:
  verify args and install
  configure if specified
without args:
  prompt for framework
  prompt for bundler
  install packages
  prompt for configuration
  configure and install packages
*/

interface BaseSettings {
  name: string | null;
  framework: string | null;
  bundler: string | null;
  configure: boolean;
  verbose: boolean;
}

const settings = {
  name: null,
  framework: null,
  bundler: null,
  configure: false,
  verbose: false,
};

/* --- CONFIGURE SETTINGS --- */

function setName(str?: string): void {
  if (typeof str === 'undefined') {
    exit('Error: Please provide a project name and try again.');
  }
  if (!/^[\w]+(\w|-|_)*[\w]+$/i.test(str)) {
    exit('Error: Project name does not meet naming conventions. See readme for help.');
  }
  settings.name = str;
}

function setOpt(opt: string): void {
  if (/^--framework=(react|vue|angular)$/.test(opt)) {
    settings.framework = opt.split('=')[1];
  } else if (/^--bundler=(webpack|browserify|rollup)$/.test(opt)) {
    settings.bundler = opt.split('=')[1];
  } else {
    exit(`Error: "${opt}" is not a valid argument.`);
  }
}

function setFlag(flag: string): void {
  if (flag === 'c') {
    settings.configure = true;
  } else if (flag === 'v') {
    settings.verbose = true;
  } else {
    exit(`Error: "${flag}" is not a valid argument.`);
  }
}

function parseArgs(args?: Array<string>): void {
  if (typeof args !== 'undefined') {
    for (let i = 0, len = args.length; i < len; i++) {
      if (/^(--).*$/.test(args[i])) {
        setOpt(args[i]);
      } else if (/^(-).*$/.test(args[i])) {
        for (let j = 1, len = args[i].length; j < len; j++) {
          setFlag(args[i].charAt(j));
        }
      } else {
        exit(`Error: ${args[i]} is not a valid argument.`);
      }
    }
  }
}

/* --- MAIN --- */

const args = process.argv.slice(2);
setName(args[0]);
parseArgs(args.slice(1));

