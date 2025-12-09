export interface PixelData {
  r: number;
  g: number;
  b: number;
  binaryR: string;
  binaryG: string;
  binaryB: string;
  x: number;
  y: number;
}

export interface ImageStats {
  width: number;
  height: number;
  samplingRate: number; // pixel block size (e.g., 1, 2, 4, 8)
  quantizationLevels: number; // e.g., 256, 16, 8, 4, 2
  bitsPerChannel: number;
  estimatedSizeInBytes: number;
}

export enum SampleImage {
  LANDSCAPE = 'https://picsum.photos/id/1018/512/512',
  CITY = 'https://picsum.photos/id/1033/512/512',
  PORTRAIT = 'https://picsum.photos/id/1027/512/512',
  ANIMAL = 'https://picsum.photos/id/1074/512/512'
}
