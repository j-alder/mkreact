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
    dev: [],
  },
  parcel: {
    main: [],
    dev: ['parcel-bundler'],
  },
  react: {
    main: ['react', 'react-dom'],
    dev: ['@babel/core', '@babel/preset-react', 'babel-loader'],
  },
  rollup: {
    main: ['rollup'],
    dev: [],
  },
  vue: {
    main: [],
    dev: [],
  },
  webpack: {
    main: [],
    dev: ['webpack', 'webpack-cli', 'webpack-dev-server'],
  },
}

