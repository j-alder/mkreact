type Dependencies = {
  [key: string]: {
    main: Array<string>;
    dev: Array<string>;
  };
};

export const dependencies: Dependencies = {
  react: {
    main: ['react', 'react-dom'],
    dev: ['babel', 'babel-loader', 'babel-preset-react'],
  },
  webpack: {
    main: [],
    dev: [],
  },
  rollup: {
    main: [],
    dev: [],
  },
  browserify: {
    main: [],
    dev: [],
  },
  parcel: {
    main: [],
    dev: ['parcel-bundler'],
  },
}

