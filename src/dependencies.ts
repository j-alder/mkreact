type Dependencies = {
  [key: string]: {
    main: Array<string>;
    dev: Array<string>;
  };
};

/** dependencies of frameworks and bundlers */
export const dependencies: Dependencies = {
  browserify: {
    main: [],
    dev: ['browserify', 'babelify', 'beefy', 'watchify'],
  },
  parcel: {
    main: [],
    dev: ['parcel-bundler'],
  },
  react: {
    main: ['react', 'react-dom'],
    dev: ['@babel/core', '@babel/preset-env', '@babel/preset-react', 'babel-loader'],
  },
  rollup: {
    main: ['rollup'],
    dev: [],
  },
  webpack: {
    main: [],
    dev: ['webpack', 'webpack-cli', 'webpack-dev-server'],
  },
}

