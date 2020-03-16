import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import { logger } from './utils';
import { Config } from './config';

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
const log = logger('render');
const readdir = promisify(fs.readdir);

async function runFFMpeg({ filename, framesDir, framesPerSecond, audio, width, height }: Required<Config>) {
  const framesCount = (await readdir(framesDir)).length;

  const audioParams: Array<string | null> = [];
  if (audio) {
    log('audio', audio);
    const duration = Math.floor(framesCount / framesPerSecond);
    const fadeOutStart = duration - audio.fadeOutDuration;

    audioParams.concat([
       // stream_loop has to come before stream that it affects
      audio.loop ? '-stream_loop' : null,
      audio.loop ? '-1' : null,
      '-i', `${ audio.path }`,
      // audio fade in/out
      '-filter_complex', `afade=in:st=0:d=${ audio.fadeInDuration }, afade=out:st=${ fadeOutStart }:d=${ audio.fadeOutDuration }`,
    ]);
  }

  const params = [
    '-r', framesPerSecond,
    '-f', 'image2',
    '-s', `${ width }x${ height }`,
    '-start_number', 0,
    '-i', `${ framesDir }/%d.png`,
    ...audioParams,
    '-frames:v', framesCount,
    '-vcodec', 'libx264', // H264.AVC codec
    '-crf', 5, // less is better quality 0-51
    '-pix_fmt', 'yuv420p', // pixel format
    '-y', // overwrite
    // '-shortest', // end with shorter stream end
    `${ filename }.mp4`,
  ].filter(isDefined);

  log('params', params);
  log('ffmpeg');
  const child = spawn('ffmpeg', params as string[]);

  child.stderr.on('data', (buffer) => {
    const message = buffer.toString('utf8');
    const ALLOWED = ['frame=', 'Output', 'Input'];
    if (!ALLOWED.some((start) => message.startsWith(start))) return;

    console.log(message);
  });

  return new Promise((resolve) => {
    child.on('close', (code) => {
      log('ffmpeg finished with code', code);
      resolve();
    });
  });
}

export async function render(config: Required<Config>) {
  log('init');

  await runFFMpeg(config);
  log('video created', config.filename);
  log('finished');
}
