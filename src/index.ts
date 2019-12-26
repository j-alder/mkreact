const fs = require('fs');
const { spawnSync } = require('child_process');
const { exit } = require('./error');
const { dependencies } = require('./dependencies');
const { yesNo, multiChoice } = require('./prompts');

/* --- DEFAULT CONFIG --- */

type BaseConfig = {
  currentDir: string;
  name: string | null;
  path: string | null;
  framework: string | null;
  bundler: string | null;
  configure: boolean | null;
  git: boolean | null;
  verbose: boolean;
};

// initialize global starting config
// TODO find a better way to store global config?
const config: BaseConfig = {
  currentDir: process.env.PWD,
  name: null,
  path: null,
  framework: null,
  bundler: null,
  configure: null,
  git: null,
  verbose: false,
};

/* --- CONFIG MUTATION --- */

function setName(str?: string): void {
  if (typeof str === 'undefined') {
    exit('Error: Please provide a project name and try again.');
  }
  if (!/^[\w]+(\w|-|_)*[\w]+$/i.test(str)) {
    exit('Error: Project name does not meet naming conventions. See readme for help.');
  }
  config.name = str;
  config.path = `${config.currentDir}/${str}`;
}

function setArg(opt: string): void {
  if (/^--framework=(react|vue|angular)$/.test(opt)) {
    config.framework = opt.split('=')[1];
  } else if (/^--bundler=(webpack|browserify|rollup)$/.test(opt)) {
    config.bundler = opt.split('=')[1];
  } else {
    exit(`Error: "${opt}" is not a valid argument.`);
  }
}

function setFlag(flag: string): void {
  if (flag === 'c') {
    config.configure = true;
  } else if (flag === 'g') {
    config.git = true;
  } else if (flag === 'v') {
    config.verbose = true;
  } else {
    exit(`Error: "${flag}" is not a valid argument.`);
  }
}

function parseArgs(args?: Array<string>): void {
  if (typeof args !== 'undefined') {
    for (let i = 0, len = args.length; i < len; i++) {
      if (/^(--).*$/.test(args[i])) {
        setArg(args[i]);
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

/* --- NPM --- */

const install = (args: Array<string>): void => {
  if (config.verbose) {
    console.log(`installing: ${args.join(', ')}...`);
  }
  spawnSync('npm', ['install', ...args, '--save']);
};

const installDev = (args: Array<string>): void => {
  if (config.verbose) {
    console.log(`installing ${args.join(', ')}...`);
  }
  spawnSync('npm', ['install', ...args, '--save-dev']);
}


/* --- FILE SYSTEM --- */

/** Create project directory and package.json */
const scaffold = (): void => {
  if (config.verbose) console.log(`creating directory: ${config.path}...`);
  fs.mkdirSync(config.path);
  process.chdir(config.path);
  fs.writeFileSync(`${config.path}/package.json`, JSON.stringify({
    name: config.name,
    author: '',
    version: '0.1.0',
    main: 'index.js',
    license: 'UNLICENSED',
  }, null, 2));
};

/* --- PACKAGE CONFIG --- */

function setOptions() {
  if (config.framework === null) {
    config.framework = multiChoice(
      'Which application framework are you using?',
      ['react', 'vue'],
      'react'
    );
  }
  if (config.bundler === null) {
    config.bundler = multiChoice(
      'Which bundler would you like to install?',
      ['none', 'webpack', 'browserify', 'rollup', 'parcel'],
      'webpack'
    );
  }
  if (config.git === null) {
    config.git = yesNo('Initialize git repository?', false);
  }
  console.log(config);
}


/* --- MAIN --- */

setOptions();

//const args = process.argv.slice(2);
//setName(args[0]);                             // set project name
//parseArgs(args.slice(1));                     // read and set arguments and flags
//scaffold();                                   // create dir + package.json
//promptForInstallationCandidates();
//install([                                     // install dependencies
//  ...dependencies[config.framework].main,
//  ...dependencies[config.bundler].main,
//]);
//installDev([                                  // install dev dependencies
//  ...dependencies[config.framework].main,
//  ...dependencies[config.bundler].main,
//]);
//configure();

