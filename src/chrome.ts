import chromeLauncher =  require('chrome-launcher');
import { Config } from './config';

export const launch = ({
  headless = true,
  port = 9222,
  flags = [],
  debug = false
}: Required<Config>['chrome'] = {}) =>
  chromeLauncher.launch({
    port,
    logLevel: debug ? 'verbose' : 'silent',
    chromeFlags: [
      '--no-sandbox',
      '--incognito',
      '--hide-scrollbars',

      '--enable-begin-frame-control',
      '--enable-surface-synchronization',
      '--run-all-compositor-stages-before-draw',
      '--disable-threaded-animation',
      '--disable-threaded-scrolling',
      '--disable-checker-imaging',

      headless ? '--headless' : '',

      ...flags,
    ],
  });
