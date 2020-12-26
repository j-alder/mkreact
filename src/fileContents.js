module.exports = {
  babelRc:
  `{
    "presets": [
      "@babel/preset-env",
      "@babel/preset-react"
    ]
  }
  `,

  indexHtml:
  `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>React app</title>
    </head>

    <body>
      <div id="root"></div>
    </body>
  </html>
  `,

  mainComponent:
  `import React from 'react';
  import ReactDOM from 'react-dom';

  function Main() {
    return (
      <div>
        <p>React app bootstrapped with <code>mkreact</code></p>
      </div>
    );
  }

  Main.displayName = 'Main';

  ReactDOM.render(<Main />, document.getElementById('root'));
  `,

  webpackConfig:
  `var HtmlWebpackPlugin = require('html-webpack-plugin');
  var path = require('path');
  var APP_PATH = path.resolve(__dirname, 'src');

  module.exports = {

    entry: APP_PATH,

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/',
    },

    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.(js)x?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            plugins: ['@babel/plugin-transform-runtime'],
          }
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: path.join(APP_PATH, 'index.html'),
      }),
    ],

    devServer: {
      historyApiFallback: true,
    },

  };
  `,
};
