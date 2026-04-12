import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
};

export type AudioFormat = 'mp3' | 'wav' | 'aiff' | 'aac' | 'flac';

export const exportAudio = async (
  audioDataUrl: string,
  format: AudioFormat,
  fileName: string
) => {
  const ffmpeg = await loadFFmpeg();
  const inputName = 'input.webm'; // Assuming input is webm from MediaRecorder
  const outputName = `output.${format}`;

  // Write input file to FFmpeg's virtual file system
  await ffmpeg.writeFile(inputName, await fetchFile(audioDataUrl));

  // Run conversion
  // For WAV, AIFF, FLAC, we use specific encoders
  let command: string[] = [];
  switch (format) {
    case 'mp3':
      command = ['-i', inputName, '-codec:a', 'libmp3lame', '-qscale:a', '2', outputName];
      break;
    case 'wav':
      command = ['-i', inputName, '-codec:a', 'pcm_s16le', outputName];
      break;
    case 'aiff':
      command = ['-i', inputName, '-codec:a', 'pcm_s16be', outputName];
      break;
    case 'aac':
      command = ['-i', inputName, '-codec:a', 'aac', '-b:a', '192k', outputName];
      break;
    case 'flac':
      command = ['-i', inputName, '-codec:a', 'flac', outputName];
      break;
  }

  await ffmpeg.exec(command);

  // Read output file
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: `audio/${format}` });
  const url = URL.createObjectURL(blob);

  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
