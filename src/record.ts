import { promisify } from 'util';
import fs from 'fs';
import { logger } from './utils';
import { Config } from './config';

const log = logger('record');
const writeFile = promisify(fs.writeFile);

const waitForStopSignal = ({ Runtime }: any): Promise<void> => Runtime.evaluate({
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
                   window.RECORDING_STOP = resolve;
                   window.RECORDING_ERROR = reject;
                 })`,
  }).catch((error: string) => {
    log('error in page context', error);
  });

type Frame = string;
let savedCount = 0;
async function save(dir: string, list: Frame[]) {
  const all = list
    .filter(Boolean)
    .map((frame, index) => writeFile(
      `${ dir }/${ savedCount + index }.png`,
      Buffer.from(frame, 'base64'), 'base64')
    );

  await Promise.all(all);
  savedCount += list.length;
}

export async function record(
  client: any,
  { framesDir, framesPerSecond, maxFramesCount, shouldWaitForRecordStart }: Required<Config>
): Promise<void> {
  const INTERVAL = 1000 / framesPerSecond;
  const SAVE_BATCH = framesPerSecond * 5;

  try {
    const { Emulation, HeadlessExperimental, Runtime } = client;
    if (shouldWaitForRecordStart) {
      await Runtime.evaluate({
        awaitPromise: true,
        expression: `new Promise((resolve, reject) => {
                       window.RECORDING_START = resolve;
                     })`,
      });
    }

    const { virtualTimeTicksBase } = await Emulation.setVirtualTimePolicy({ policy: 'pause' });
    await HeadlessExperimental.beginFrame();
    log('initial time', virtualTimeTicksBase);
    log('frame rate', framesPerSecond);

    let frames: Frame[] = [];
    let counter = 1;
    let shouldRecord = true;
    waitForStopSignal(client).then(() => {
      shouldRecord = false;
    });

    log('start');
    while (shouldRecord) {
      if (counter % framesPerSecond === 0) log('screenshot', counter);

      const { screenshotData } = await HeadlessExperimental.beginFrame({
        frameTimeTicks: virtualTimeTicksBase + counter * INTERVAL,
        screenshot: { format: 'png' },
      });

      frames.push(screenshotData);
      if (counter % SAVE_BATCH === 0) {
        await save(framesDir, frames);
        frames = [];
      }

      await Emulation.setVirtualTimePolicy({ policy: 'advance', budget: INTERVAL });

      if (maxFramesCount && counter > maxFramesCount) break;
      counter++;
    }

    await save(framesDir, frames);
    log('seconds recorded', Math.floor(savedCount / framesPerSecond));
    log('frames count', savedCount);
  } catch (err) {
    console.error('[RECORD] Error while recording:', err);
    if (client) client.close();

    throw err;
  }
}
