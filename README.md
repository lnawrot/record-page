# record-page

Library for recording web page in high resultion with specified frame rate using Headless Chrome.

Uses virtual time budgeting under the hood. Produces smooth video as each frame before capture is given enough time to flush all changes to the screen.

**Note:** Library uses *HeadlessExperimental* domain of Chrome DevTools Protocol, as a name indicates it's experimental, so it may stop working with future Chrome updates. Works well on Chrome 80.

<video controls>
    <source src="https://github.com/lnawrot/record-page/raw/master/assets/demo.mp4"
            type="video/mp4">
    Sorry, your browser doesn't support embedded videos.
</video>

## Install

```
$ npm install record-page
```

## Requirements

* [Chrome launcher](https://www.npmjs.com/package/chrome-launcher) needs to be able to start Chrome instance.

* [ffmpeg](https://www.ffmpeg.org/download.html) is required to be installed in order to render video files (also available as a command `ffmpeg`).


## Usage

```js
const record = require('record-page');

(async () => {
  await record({
    url: 'https://animejs.com/',
    maxFramesCount: 150,
  });
  console.log('Finished, video.mp4 generated!');
})();
```

Frames are recording can be stopped by defining `maxFramesCount` parameter or calling `window.RECORDING_STOP()` function in page context.

## Docs

### Config

#### url

Type: `string`
*Required*

URL of page to be recorded.

##### filename

Type: `string`
Default: `'video'`

Result file filename.

##### framesDir

Type: `string`
Default: `'frames'`

Name of directory where video frames will be saved.

##### framesPerSecond

Type: `number`
Default: `30`

Frame rate at which frames will be saved and then video generated.

##### maxFramesCount

Type: `number`

Defines after how many frames should recording stop.

##### width

Type: `number`
Default: `1920`

Window width.

##### height

Type: `number`
Default: `1080`

Window height;

##### delay

Type: `number`
Default: `0`

Delay recording by given *ms* duration. Applied right after page load.

##### shouldWaitForRecordStart

Type: `boolean`
Default: `false`

If `false` then recording will start immediately, otherwise only after **`window.RECORDING_START()`** will be called in page context.


##### shouldApplyReflow

Type: `boolean`
Default: `true`

In order for frame changes to be flushed and visible on screenshot in most cases forced reflow should be applied. If set to `true` then page is forced to reflow in `requestAnimationFrame` callback (it doesn't hurt performance as virutal time is used here).


##### expression

Type: `string`

Expression to be evaluated in page context. Useful for interactions with page.

##### audio

Type: `object`

Defines audio configuration applied when rendering video.
```ts
{
  path: string,
  loop: boolean,
  // in seconds
  fadeInDuration: number,
  fadeOutDuration: number,
}
```

##### chrome

Type: `object`

Chrome launch options.
```ts
{
  headless?: boolean,
  port?: number,
  debug?: boolean,
  flags?: string[],
}
```

##### onInit

Type: `callback`

Callback executed after client is initialized. `chrome-remote-interface` client is passed as an argument.

## Roadmap

* easier interactions with page (maybe with Puppeteer?)
* more precise handling when recording stops
* allow modifying params passed to **ffmpeg**










