import rimraf from 'rimraf';
import fs from 'fs';
import { promisify } from 'util';

import DEFAULT_CONFIG, { Config } from './config';
import { launch } from './chrome';
import { setup } from './setup';
import { record } from './record';
import { render } from './render';

export = async function(options: Config) {
  if (!options.url) throw new Error('"url" is required');
  const config = { ...DEFAULT_CONFIG, ...options } as Required<Config>;

  rimraf.sync(config.framesDir);
  if (!fs.existsSync(config.framesDir)) {
    await promisify(fs.mkdir)(config.framesDir);
  }

  const startTimestamp = Date.now();
  let chrome = null;
  try {
    chrome = await launch();

    const client = await setup(config);
    await record(client, config);
    await render(config);

    client.close();
    if (chrome) chrome.kill();
  } catch(error) {
    console.error(error);
    if (chrome) {
      chrome.kill();
    }
  }

  console.log('FINISHED', Math.round((Date.now() - startTimestamp) / 1000), 's');
};
