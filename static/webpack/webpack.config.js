const path = require('path');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    compress: true,
  },
  entry: './src/index.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.m?js/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
    ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build'),
  },
};
