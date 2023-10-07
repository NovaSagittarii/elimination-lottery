import { Howl } from 'howler';

export type SoundTypes = 'notify' | 'join';

const files = new Map<SoundTypes, string>([['notify', '/Bubble.mp3']]);

export const Sounds = new Map<SoundTypes, Howl>(
  [...files.entries()].map(([k, path]) => [k, new Howl({ src: [path] })]),
);
