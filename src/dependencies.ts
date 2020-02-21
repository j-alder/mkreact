type Dependencies = {
  [key: string]: {
    main: Array<string>;
    dev: Array<string>;
  };
};

/** dependencies of frameworks and bundlers */
export const dependencies: Dependencies = {
  parcel: {
    main: [],
    dev: ['parcel-bundler'],
  },
  react: {
    main: ['react', 'react-dom'],
    dev: ['@babel/core', '@babel/preset-env', '@babel/preset-react', 'babel-loader'],
  },
  webpack: {
    main: [],
    dev: ['webpack', 'webpack-cli', 'webpack-dev-server'],
  },
}

