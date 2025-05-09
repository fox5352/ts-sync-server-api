import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

import { IAudioMetadata, parseFile } from 'music-metadata';
import Logger from './logger';
import { buffer } from 'node:stream/consumers';

export async function getMimeType(buffer: Uint8Array): Promise<string> {
  // Magic numbers for common file types
  const signatures = {
    ffd8ffe0: 'image/jpeg',
    '89504e47': 'image/png',
    '47494638': 'image/gif',
    '52494646': 'audio/wav', // RIFF header
    '4944332e': 'audio/mp3', // ID3v2
    '66747970': 'video/mp4', // ftyp
    '1a45dfa3': 'video/webm', // EBML
  };

  const hexSlice = buffer.slice(0, 4).toString().toLocaleLowerCase();

  for (const [signature, mimeType] of Object.entries(signatures)) {
    if (hexSlice.startsWith(signature.toLowerCase())) {
      return mimeType;
    }
  }

  return 'application/octet-stream';
}

export async function getAudioMetaData(
  path: string,
): Promise<{ duration: number; sampleRate: number } | null> {
  try {
    const metadata: IAudioMetadata = await parseFile(path);

    return {
      duration: metadata.format.duration || 0,
      sampleRate: metadata.format.sampleRate || 0,
    };
  } catch (error) {
    Logger.error(error);
    return null;
  }
}

export async function generateThumbnailBuffer(imagePath: string, width = 155, height = 155) {
  try {
    const file = Buffer.from(await readFile(imagePath));

    return file;
  } catch (err) {
    Logger.error(`Error creating thumbnail:${err}`);
    return null; // Re-throw the error for handling elsewhere if needed.
  }
}

async function getFileMetadata(filePath: string, type: string) {}
