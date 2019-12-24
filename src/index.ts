const fs = require('fs');
const { spawnSync } = require('child_process');
const { exit } = require('./error');

/*
CLI flow
ffs <project-name> [args] [/path/to/directory] 
  args:
    --framework: react, vue, angular
    --bundler: (webpack), browserify, rollup
    -c, --configure: boolean (false)
    -g, --git: boolean (false)
    -v, --verbose: boolean (false)
1. create directory
2. prompt if necessary and install packages
3. 
*/

interface BaseSettings {
  root: string;
  name: string | null;
  framework: string | null;
  bundler: string | null;
  configure: boolean;
  git: boolean;
  verbose: boolean;
}

/* --- DEFAULT SETTINGS --- */

const settings: BaseSettings = {
  root: process.env.PWD,
  name: null,
  framework: null,
  bundler: null,
  configure: false,
  git: false,
  verbose: false,
};

let path = null;

/* --- FILE SYSTEM --- */

const mkdir = (): void => {
  if (settings.verbose) {
    console.log(`creating directory: ${path}...`);
  }
  fs.mkdirSync(path);
};

const writeFile = (pathWithName: string, contents: string): void => {
  fs.writeFileSync(pathWithName, contents);
}

const scaffold = (): void => {
  mkdir();
  process.chdir(path);
  fs.writeFileSync(`${path}/package.json`, "FOO");
};


/* --- NPM --- */

const install = (args: Array<string>): void => spawnSync('npm', ['install', ...args, '--save']);

const installDev = (args: Array<string>): void => spawnSync('npm', ['install', ...args, '--save-dev']);

/* --- SETTINGS --- */

function setName(str?: string): void {
  if (typeof str === 'undefined') {
    exit('Error: Please provide a project name and try again.');
  }
  if (!/^[\w]+(\w|-|_)*[\w]+$/i.test(str)) {
    exit('Error: Project name does not meet naming conventions. See readme for help.');
  }
  settings.name = str;
  path = `${settings.root}/${str}`;
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
  } else if (flag === 'g') {
    settings.git = true;
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
      // TODO parse installation path
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
scaffold();

