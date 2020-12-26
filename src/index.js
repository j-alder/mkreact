#!/usr/bin/env node

var inquirer = require("inquirer");
var { spawnSync } = require("child_process");
var fs = require("fs");
var path = require("path");
var files = require("./fileContents");

/**
 * Display an error message and exit the application with code 1
 * @param {string} message
 */
function terminateWithError(message) {
  console.error(message);
  process.exit(1);
}

/**
 * Orchestrate the installation of dependencies
 * @param {Object} config
 */
function npmInstall(config) {
  console.log("installing dependencies...");
  try {
    process.chdir(config.path);
    spawnSync("npm", ["install", ...config.dependencies, "--save"]);
    spawnSync("npm", ["install", ...config.devDependencies, "--save-dev"]);
  } catch (error) {
    terminateWithError(error);
  }
}

/**
 * Create project directories, initialize npm, webpack and git
 * @param {Object} config
 */
function scaffold(config) {
  if (fs.existsSync(config.path)) {
    terminateWithError(`Error: ${config.path} already exists.`);
  }
  var packageJSON = {
    name: config.name,
    author: "",
    version: "0.1.0",
    scripts: {
      dev:
        "webpack serve --config webpack.config.js --progress --mode=development",
      build: "webpack -p",
      sass: "sass --watch ./src/styles",
    },
    license: "UNLICENSED",
  };
  console.log("creating directories...");
  fs.mkdirSync(config.path);
  fs.mkdirSync(`${config.path}/src`);
  fs.mkdirSync(`${config.path}/src/styles`);
  fs.mkdirSync(`${config.path}/build`);
  fs.writeFileSync(`${config.path}/src/index.html`, files.indexHtml);
  fs.writeFileSync(`${config.path}/src/index.js`, files.mainComponent);
  fs.writeFileSync(`${config.path}/.babelrc`, files.babelRc);
  fs.writeFileSync(`${config.path}/webpack.config.js`, files.webpackConfig);
  console.log("writing package.json...");
  fs.writeFileSync(
    `${config.path}/package.json`,
    JSON.stringify(packageJSON, null, 2)
  );
}

/**
 * Create questions based on config properties
 * @param {Object} config
 */
function generateQuestions(config) {
  var questions = [];
  if (!config.name) {
    questions.push({
      type: "input",
      name: "name",
      message: "Project name:",
    });
  }
  return questions;
}

function main() {
  var startTime = new Date().getTime();
  var config = {
    bunder: "webpack",
    name: process.argv[2],
    workingDir: process.env.PWD,
    dependencies: ["react", "react-dom", "react-router-dom"],
    devDependencies: [
      "babel-loader",
      "@babel/core",
      "@babel/plugin-transform-runtime",
      "@babel/preset-env",
      "@babel/preset-react",
      "html-webpack-plugin",
      "css-loader",
      "sass",
      "sass-loader",
      "style-loader",
      "webpack",
      "webpack-cli",
      "webpack-dev-server",
    ],
  };

  var questions = generateQuestions(config);

  inquirer
    .prompt(questions)
    .then((answers) => {
      config = {
        ...config,
        ...answers,
      };
      config.path = `${config.workingDir}/${config.name}`;
      scaffold(config);
      npmInstall(config);
      var endTime = new Date().getTime();
      console.log(`done in ${(endTime - startTime) / 1000} seconds`);
    })
    .catch((error) => {
      terminateWithError(error);
    });
}

main();
