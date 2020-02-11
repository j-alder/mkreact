/** Functions used for the configuration of individual modules */
import { yesNo } from 'prompts';
/**
 * Main configuration function, with general project config
 * and delegation to specialized configuration functions.
 * @param config - configuration options set by user
 */
export async function configure(config: BaseConfig) {
  
  if (config.bundler) {
    await yesNo(`Configure ${config.bundler}?`, true);
    if (config.bundler === 'webpack') {
      
    }
  }
}

