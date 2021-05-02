#! /usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const files = require('./fileContents');
const { Command } = require('commander');
const inquirer = require('inquirer');

const ConfigKeys = {
  PROJECT_NAME: 'name',
  BUNDLER: 'bundler'
}

const program = new Command()
    .version('1.0.0')
    .option('-v, --verbose', 'enable verbose output')
    .option(`-n, --${ConfigKeys.PROJECT_NAME} <name>`, 'name for the project\'s root directory')
    .option(`-b, --${ConfigKeys.BUNDLER} <bundler>`, 'bundler to use')
    .parse(process.argv)
;

const workingDir = process.env.PWD;

function terminateWithError(message) {
  console.error(message);
  process.exit(1);
}

const webpackDependencies = [
  'html-webpack-plugin',
  'webpack',
  'webpack-cli',
  'webpack-dev-server',
];

const sassDependencies = [
  'css-loader',
  'sass',
  'sass-loader',
  'style-loader',
];

const babelDependencies = [
  'babel-loader',
  '@babel/core',
  '@babel/plugin-transform-runtime',
  '@babel/preset-env',
  '@babel/preset-react',
];

const dependencies = [
  'react',
  'react-dom',
  'react-router-dom',
];

const devDependencies = [
  ...babelDependencies,
  ...sassDependencies,
  ...webpackDependencies
];

const config = {
  workingDir,
  dependencies,
  devDependencies,
  ...program.opts()
}

const questions = [];
!config[ConfigKeys.PROJECT_NAME] && questions.push({
  type: 'input',
  name: ConfigKeys.PROJECT_NAME,
  message: 'Project name:'
});
!config[ConfigKeys.BUNDLER] && questions.push({
  type: 'list',
  name: ConfigKeys.BUNDLER,
  message: 'Bundler:',
  choices: ['webpack', 'rollup', 'browserify']
});

const getConfig = answers => ({
  ...config,
  ...answers,
  path: `${config.workingDir}/${config[ConfigKeys.PROJECT_NAME] || answers[ConfigKeys.PROJECT_NAME]}`
});

const confirmConfig = config => inquirer.prompt([{
  type: 'confirm',
  name: 'isOk',
  message: `Is this config correct?`,
}])
    .then(c => c['isOk'] ? config : terminateWithError('try again!'));

const scaffold = config => {
  if (fs.existsSync(config.path)) {
    terminateWithError(`Error: ${config.path} already exists`);
  }
  const packageJSON = {
    name: config.name,
    author: '',
    version: '0.1.0',
    scripts: {
      dev: 'webpack serve --config webpack.config.js --progress --mode=development',
      build: 'webpack -p',
      sass: 'sass --watch ./src/styles',
    },
    license: 'UNLICENSED',
  };
  console.log('creating directories...');
  fs.mkdirSync(config.path);
  fs.mkdirSync(`${config.path}/src`);
  fs.mkdirSync(`${config.path}/src/styles`);
  fs.mkdirSync(`${config.path}/build`);
  fs.writeFileSync(`${config.path}/src/index.html`, files.indexHtml);
  fs.writeFileSync(`${config.path}/src/index.js`, files.mainComponent);
  fs.writeFileSync(`${config.path}/.babelrc`, files.babelRc);
  fs.writeFileSync(`${config.path}/webpack.config.js`, files.webpackConfig);
  console.log('writing package.json...');
  fs.writeFileSync(
      `${config.path}/package.json`,
      JSON.stringify(packageJSON, null, 2)
  );
  return config;
}

const installDeps = config => {
  try {
    console.log('installing dependencies...')
    process.chdir(config.path);
    spawnSync('npm', ['install', ...config.dependencies, '--save']);
    spawnSync('npm', ['install', ...config.devDependencies, '--save-dev']);
    return config;
  } catch (error) {
    terminateWithError(error);
  }
}

inquirer
    .prompt(questions)
    .then(getConfig)
    .then(confirmConfig)
    .then(scaffold)
    .then(installDeps)
;
