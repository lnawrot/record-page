export type Config = {
  chrome?: {
    headless?: boolean,
    port?: number,
    debug?: boolean,
    flags?: string[],
  },

  url: string,
  filename?: string,
  framesDir?: string,
  onInit?: (client: any) => void,

  framesPerSecond?: number,

  width?: number,
  height?: number,

  delay?: number,
  shouldWaitForRecordStart?: boolean,
  shouldApplyReflow?: boolean,
  maxFramesCount?: number,

  // to be run in page context
  expression?: string,

  audio?: {
    path: string,
    loop: boolean,
    fadeInDuration: number,
    fadeOutDuration: number,
  },
};

const CONFIG: Config = {
  url: '',
  filename: 'video',
  framesDir: 'frames',
  delay: 0,

  framesPerSecond: 30,
  width: 1920,
  height: 1080,

  shouldApplyReflow: true,
  shouldWaitForRecordStart: false,
};
export default CONFIG;
