interface WebpackConfig {
  mode: 'production' | 'development' | 'none';
  entry: string;
}

async function webpackConfig(): Promise<void> {
  const wpConfig: WebpackConfig = {
    mode: 'production',
    entry: 'src/index.js',
  };
  wpConfig.mode = await multiChoice(
    'default mode',
    ['production', 'development', 'none'],
    'development'
  );
}

async function parcelConfig(): Promise<void> {

}

export async function configure(): Promise<void> {
  if (!config.configure) {
    if (!await yesNo('Would you like to configure installed packages?')) {
      return;
    }
  }
  // bundler config
  if (await yesNo(`Configure ${config.bundler}?`)) {
    if (config.bundler === 'webpack') {
      webpackConfig();
    }
    if (config.bundler === 'parcel') {
      parcelConfig();
    }
  }
  return;
}
