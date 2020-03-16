import CDP = require('chrome-remote-interface');
import { logger } from './utils';
import { Config } from './config';

const log = logger('setup');

export async function setup({ url, width, height, delay, onInit, shouldApplyReflow, expression }: Required<Config>) {
  let client = null;
  try {
    client = await CDP();
    const { Target } = client;
    const { targetId } = await Target.createTarget({
      enableBeginFrameControl: true,
      url,
      width,
      height,
    });

    client = await CDP({ target: targetId });
    const { DOM, Emulation, HeadlessExperimental, Page, Runtime, Storage } = client;

    await Page.enable();
    await DOM.enable();
    await HeadlessExperimental.enable();
    await Runtime.enable();
    log('domains enabled');

    await Storage.clearDataForOrigin({ origin: url, storageTypes: 'local_storage' });

    await Emulation.setDeviceMetricsOverride({
      width,
      height,
      fitWindow: true,
      deviceScaleFactor: 1,
      mobile: false,
    });
    log('metrics override');
    log('width', width);
    log('height', height);

    if (typeof onInit === 'function') onInit(client);

    await Page.navigate({ url });
    log('navigated', url);

    await Page.loadEventFired();
    log('loaded');

    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

    // run code in page context
    if (typeof expression === 'string') {
      await Runtime.evaluate({ expression });
    }

    if (shouldApplyReflow) {
      Runtime.evaluate({
        expression: `
          function RECORDING_TRIGGER_REFLOW() {
            // trigger reflow
            window.innerHeight;
            window.requestAnimationFrame(RECORDING_TRIGGER_REFLOW);
          }
          RECORDING_TRIGGER_REFLOW();`,
      })
    }

    return client;
  } catch (err) {
    console.error('[SETUP] Error while setup:', err);
    if (client) client.close();

    throw err;
  }
}
