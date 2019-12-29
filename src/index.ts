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
  verbose: true,
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
  } else if (flag === 's') {
    config.verbose = false;
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
    console.log(`installing ${args.join(', ')}...`);
  }
  spawnSync('npm', ['install', ...args, '--save']);
};

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
  fs.mkdirSync(config.path);
  fs.mkdirSync(`${config.path}/src/`);
  process.chdir(config.path);
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
  process.chdir(`${config.path}/src`);
  if (config.verbose) console.log(`copying boilerplate files for ${config.framework}...`);
  fs.copyFile(
    `${process.env.PWD}/../files/react/index.js`,
    `${config.path}/src/index.js`,
    (err: Error) => err && exit(`An error occurred: ${err}`)
  );
  fs.copyFile(
    `${process.env.PWD}/../files/react/App.js`,
    `${config.path}/src/App.js`,
    (err: Error) => err && exit(`An error occurred: ${err}`)
  );
  fs.copyFile(
    `${process.env.PWD}/../files/react/.babelrc`,
    `${config.path}/.babelrc`,
    (err: Error) => err && exit(`An error occurred: ${err}`)
  );
};

/* --- PACKAGE CONFIG --- */

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
  console.log(config);
  await setOptions();
  console.log(config);
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

