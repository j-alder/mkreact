const fs = require('fs');
const { spawnSync } = require('child_process');
const { exit } = require('./error');
const { dependencies } = require('./dependencies');
const { yesNo, multiChoice } = require('./prompts');

/* --- DEFAULT CONFIG --- */

interface BaseConfig {
  bundler: string | null;
  configure: boolean | null;
  currentDir: string | null;
  framework: string | null;
  git: boolean | null;
  name: string | null;
  path: string | null;
  port: number | null;
  verbose: boolean;
}

// TODO find a better way to store globally -JA
/** global default config */
const config: BaseConfig = {
  bundler: null,
  configure: null,
  currentDir: process.env.PWD || null,
  framework: 'react',
  git: null,
  name: null,
  path: null,
  port: null,
  verbose: true,
};

/* --- CONFIG MUTATION --- */

/**
 * Set the name and path of the project
 * @param n - user-defined name
 */
function setName(n?: string): void {
  if (!n) {
    exit('Error: Please provide a project name and try again.');
  } else {
    // check that name includes only letters, underscores and/or dashes
    if (!/^[\w]+(\w|-|_)*[\w]+$/i.test(n)) {
      exit('Error: Project name does not meet naming conventions. See readme for help.');
    }
    // set name
    config.name = n;
    // set project dir
    config.path = `${config.currentDir}/${n}`;
  }
}

/**
 * Configure setting based on command-line argument
 * @param arg
 */
function setOption(arg: string): void {
  if (/^--framework=(react|vue|angular)$/.test(arg)) {
    config.framework = arg.split('=')[1];
  } else if (/^--bundler=(webpack|parcel)$/.test(arg)) {
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

/** Message with general help and command breakdown */
const help = `
---- mkreact help ----

  COMMAND LINE ARGUMENTS:
    --help: Display this menu
    --bundler: Specify the bundler you would like to use.
      Options are:
      - webpack
      - parcel

  FLAGS:
    -c: Configure. Tell mkreact that you would like to walk through
        the configuration process of installed packages.
    -s: Succinct. Turn off verbose mode and mute status output until
        mkreact finishes the installation process.
    
  EXAMPLE USING ARGUMENTS AND FLAGS:
    mkreact projectName --bundler=webpack -cs
`;

/**
 * Iterate through command-line arguments and set options based on them
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
function install(args: Array<string>): void {
  if (config.verbose) {
    console.log(`installing ${args.join(', ')}...`);
  }
  spawnSync('npm', ['install', ...args, '--save']);
}

/**
 * Runs npm install --save-dev
 * @param args - packages to install
 */
function installDev(args: Array<string>): void {
  if (config.verbose) {
    console.log(`installing ${args.join(', ')}...`);
  }
  spawnSync('npm', ['install', ...args, '--save-dev']);
}

interface Scripts {
  dev?: string;
  build?: string;
  test: string;
  watch?: string;
}

interface PackageJSON {
  name: string;
  author: string;
  version: string;
  main?: string;
  private?: boolean;
  scripts: Scripts;
  license: string;
}

/**
 * Configure build and run scripts for chosen bundler
 * @param bundler
 */
function bundlerScripts(bundler: string): Scripts {
  const defaults = {
    test: 'echo "Error: no tests specified" && exit 1',
  }
  if (bundler === 'parcel') {
    return {
      dev: 'parcel src/index.html',
      build: 'parcel build src/index.html',
      ...defaults,
    }
  }
  if (bundler === 'webpack') {
    return {
      dev: 'webpack-dev-server',
      build: 'webpack --config webpack.config.js',
      ...defaults,
    }
  }
  return defaults;
}

/* --- FILE SYSTEM --- */

/**
 * Copy a file from source to destination
 * @param srcFile   - source file path
 * @param destFile  - destination file path
 */
function cp(srcFile: string, destFile: string) {
  fs.copyFile(
    srcFile,
    destFile,
    (err: Error) => err && exit(`An error occurred: ${err}`)
  );
}

/** Create project directory structure and package.json */
function scaffold(): void {
  if (!config.path || !config.name || !config.bundler) {
    exit(`Error: The following were not defined:` +
         `${!config.path ? '\ninstallation path' : ''} ` +
         `${!config.name ? '\nproject name' : ''}` +
         `${!config.bundler ? '\nbundler' : ''}`);
  } else {
    if (config.verbose) {
      console.log(`creating directories in ${config.path}...`);
    }
    // create root and src directories
    fs.mkdirSync(config.path);
    fs.mkdirSync(`${config.path}/src/`);
    if (config.bundler === 'webpack') {
      fs.mkdirSync(`${config.path}/build/`);
    }
    process.chdir(config.path);
    // initialize and write package.json in root
    const packageJSON: PackageJSON = {
      name: config.name,
      author: '',
      version: '0.1.0',
      scripts: bundlerScripts(config.bundler),
      license: 'UNLICENSED',
    };

    if (config.bundler === 'webpack') {
      packageJSON.private = true;
    } else {
      packageJSON.main = 'index.js';
    }
    if (config.verbose) {
      console.log('writing package.json...');
    }
    fs.writeFileSync(`${config.path}/package.json`, JSON.stringify(packageJSON, null, 2));

    // generate dynamic paths for files based on chosen bundler
    let indexHtmlPath = `${config.path}/src/index.html`;
    if (config.bundler === 'webpack') {
      indexHtmlPath = `${config.path}/build/index.html`;
    }

    // cp files for framework from files directory
    process.chdir(`${config.path}/src`);

    if (config.verbose) {
      console.log('copying boilerplate files...');
    }
    const fileSrc = `${process.env.PWD}/../files`;
    const bundlerFileSrc = `${fileSrc}/${config.bundler}`;
    cp(`${bundlerFileSrc}/index.js`, `${config.path}/src/index.js`);
    cp(`${bundlerFileSrc}/index.html`, indexHtmlPath);
    cp(`${fileSrc}/.babelrc`, `${config.path}/.babelrc`);
    if (config.bundler === 'webpack') {
      cp(`${bundlerFileSrc}/webpack.config.js`, `${config.path}/webpack.config.js`);
    }
  }
}

/* --- PACKAGE CONFIG --- */

/** Find options that were not set with command-line args and query the user for them */
async function setOptions() {
  if (config.bundler === null) {
    config.bundler = await multiChoice(
      'Which bundler would you like to install?',
      [null, 'webpack', 'parcel'],
      'webpack'
    );
  }
}

/* --- MAIN --- */

async function main(args: Array<string>): Promise<void> {
  // display help menu or set project name
  if (args[0] === '--help') {
    console.log(help);
    process.exit(0);
  } else {
    setName(args[0]);
  }

  // read and operate on user-supplied arguments
  parseArgs(args.slice(1));

  // prompt for settings not determined by cli args
  await setOptions();

  // insert boilerplate files and directories
  scaffold();

  // install dependencies
  if (config.framework && config.bundler) {
    install([
      ...dependencies[config.framework].main,
      ...dependencies[config.bundler].main,
    ]);
    installDev([
      ...dependencies[config.framework].dev,
      ...dependencies[config.bundler].dev,
    ]);
  }
}

main(process.argv.slice(2));
