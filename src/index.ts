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
// TODO find a better way to store globally?
const config: BaseConfig = {
  currentDir: process.env.PWD,
  name: null,
  path: null,
  framework: null,
  bundler: null,
  configure: null,
  git: null,
  verbose: true,
};

/* --- CONFIG MUTATION --- */

/**
 * Set the name and path of the project
 * @param n
 */
function setName(n?: string): void {
  if (typeof n === 'undefined') {
    exit('Error: Please provide a project name and try again.');
  }
  // name should contain only letters and dashes and/or underscores
  if (!/^[\w]+(\w|-|_)*[\w]+$/i.test(n)) {
    exit('Error: Project name does not meet naming conventions. See readme for help.');
  }
  config.name = n;
  // set the directory path of the project
  config.path = `${config.currentDir}/${n}`;
}

/**
 * Configure setting based on command-line argument
 * @param arg
 */
function setOption(arg: string): void {
  if (/^--framework=(react|vue|angular)$/.test(arg)) {
    config.framework = arg.split('=')[1];
  } else if (/^--bundler=(webpack|browserify|rollup|parcel)$/.test(arg)) {
    config.bundler = arg.split('=')[1];
  } else {
    exit(`Error: "${arg}" is not a valid argument.`);
  }
}

/**
 * Configure setting based on command-line flag
 * @param flag
 */
function setFlag(flag: string): void {
  if (flag === 'c') {
    config.configure = true;
  } else if (flag === 'g') {
    config.git = true;
  } else if (flag === 's') {
    config.verbose = false;
  } else {
    exit(`Error: "${flag}" is not a valid argument.`);
  }
}

/**
 * Loop through and set options based on command-line arguments
 * @param args - arguments supplied by user
 */
function parseArgs(args?: Array<string>): void {
  if (typeof args !== 'undefined') {
    for (let i = 0, len = args.length; i < len; i++) {
      if (/^(--).*$/.test(args[i])) {
        setOption(args[i]);
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

/**
 * Runs npm install --save
 * @param args - packages to install
 */
const install = (args: Array<string>): void => {
  if (config.verbose) {
    console.log(`installing ${args.join(', ')}...`);
  }
  spawnSync('npm', ['install', ...args, '--save']);
};

/**
 * Runs npm install --save-dev
 * @param args - packages to install
 */
const installDev = (args: Array<string>): void => {
  if (config.verbose) {
    console.log(`installing ${args.join(', ')}...`);
  }
  spawnSync('npm', ['install', ...args, '--save-dev']);
}

interface Scripts {
  dev?: string;
  build?: string;
}

interface PackageJSON {
  name: string;
  author: string;
  version: string;
  main: string;
  scripts: Scripts;
  license: string;
}

/**
 * Configure build and run scripts for chosen bundler
 * @param bundler
 */
function bundlerScripts(bundler: string): Scripts {
  if (bundler === 'parcel') {
    return {
      dev: 'parcel src/index.js',
      build: 'parcel build src/index.js',
    }
  }
  return {};
}

/* --- FILE SYSTEM --- */

/** Create project directory and package.json */
const scaffold = (): void => {
  if (config.verbose) console.log(`creating directories in ${config.path}...`);

  // create root and src directories
  fs.mkdirSync(config.path);
  fs.mkdirSync(`${config.path}/src/`);
  process.chdir(config.path);

  // initialize and write package.json in root
  const packageJSON = {
    name: config.name,
    author: '',
    version: '0.1.0',
    main: 'index.js',
    scripts: bundlerScripts(config.bundler),
    license: 'UNLICENSED',
  };
  if (config.verbose) console.log('writing package.json...');
  fs.writeFileSync(`${config.path}/package.json`, JSON.stringify(packageJSON, null, 2));

  // cp files for framework from files directory
  // TODO find a better way to handle this
  process.chdir(`${config.path}/src`);
  if (config.verbose) console.log(`copying boilerplate files for ${config.framework}...`);
  if (config.framework === 'react') {
    fs.copyFile(
      `${process.env.PWD}/../files/react/index.js`,
      `${config.path}/src/index.js`,
      (err: Error) => err && exit(`An error occurred: ${err}`)
    );
    fs.copyFile(
      `${process.env.PWD}/../files/react/index.html`,
      `${config.path}/src/index.html`,
      (err: Error) => err && exit(`An error occurred: ${err}`)
    );
    fs.copyFile(
      `${process.env.PWD}/../files/react/.babelrc`,
      `${config.path}/.babelrc`,
      (err: Error) => err && exit(`An error occurred: ${err}`)
    );
  }
};

/* --- PACKAGE CONFIG --- */

/** Find options that were not set with command-line args and query for them */
async function setOptions() {
  /* 
   potential options:
   framework: string | null
   bundler:   string | null
  */ 
  if (config.framework === null) {
    config.framework = await multiChoice(
      'Which application framework are you using?',
      ['react', 'vue'],
      'react'
    );
  }
  if (config.bundler === null) {
    config.bundler = await multiChoice(
      'Which bundler would you like to install?',
      [null, 'webpack', 'browserify', 'rollup', 'parcel'],
      'webpack'
    );
  }
}


/* --- MAIN --- */

const main = async (args: Array<string>) => {
  setName(args[0]);
  parseArgs(args.slice(1));
  await setOptions();
  scaffold();
  install([
    ...dependencies[config.framework].main,
    ...dependencies[config.bundler].main,
  ]);
  installDev([
    ...dependencies[config.framework].dev,
    ...dependencies[config.bundler].dev,
  ]);
}

main(process.argv.slice(2));

