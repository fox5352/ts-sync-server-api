import { extname, join } from 'node:path';
import fs from "node:fs/promises"
import { parseFile } from "music-metadata";
import Logger from './logger';
import { AudioMetaData, FileEntry, FileMetaData, FileType } from '../types';

export function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export async function getMimeType(buffer: Uint8Array): Promise<string> {
  // Magic numbers for common file types
  const signatures = {
    'ffd8ffe0': 'image/jpeg',
    '89504e47': 'image/png',
    '47494638': 'image/gif',
    '52494646': 'audio/wav',  // RIFF header
    '4944332e': 'audio/mp3',  // ID3v2
    '66747970': 'video/mp4',  // ftyp
    '1a45dfa3': 'video/webm', // EBML
  };

  // Get first 4 bytes as hex
  const hex = buffer.slice(0, 4).toString().toLowerCase();

  for (const [signature, mimeType] of Object.entries(signatures)) {
    if (hex.startsWith(signature.toLowerCase())) {
      return mimeType;
    }
  }

  return 'application/octet-stream';
}

export async function getAudioDuration(path: string): Promise<AudioMetaData | null> {
  try {

    const metaData = await parseFile(path)


    return {
      duration: metaData.format.duration,
      sampleRate: metaData.format.sampleRate
    };
  } catch (error) {
    Logger.error(`Error getting audio duration ${error}`);
    return null;
  }
}

export async function generateThumbnailBuffer(imagePath: string, width = 155, height = 155): Promise<Buffer | null> {
  try {
    const file = Buffer.from(await fs.readFile(imagePath));

    return file;
  } catch (err) {
    Logger.error(`Error creating thumbnail: ${err}`);
    return null; // Re-throw the error for handling elsewhere if needed.
  }
}

export async function getFileMetadata(filePath: string, type: FileType) {
  try {
    const stats = await fs.stat(filePath);

    let metadata: FileMetaData = {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };

    // Generate thumbnails for images and videos
    // FIX: impl image processing package
    if (type == "image") {
      const thumbnailBuffer = await generateThumbnailBuffer(filePath);

      if (thumbnailBuffer) {
        metadata.imageMetaData = {
          thumbnail: thumbnailBuffer
        }
      }
    }

    // Get duration for audio files only
    if (type == "audio" || type == "video") {
      const audioMetaData: AudioMetaData | null = await getAudioDuration(filePath);

      if (audioMetaData) {
        metadata.audioMetaData = {
          ...audioMetaData
        };
      }
    }

    return metadata;
  } catch (error) {
    Logger.error(`Error processing file:', error}`);
    throw error;
  }
}

// ------------------------------------------------------------------------------------------

export async function readFileData(filePath: string): Promise<Buffer | null> {
  try {
    if (!filePath) throw new Error("File path is required");

    const fileData = await fs.readFile(filePath, { encoding: null }); // Or { encoding: 'buffer' }

    return fileData;
  } catch (error) {
    Logger.error(`Error reading file:${error}`);
    return null;
  }
}

/**
 * Retrieves a list of files from a specified directory.//+
 * @param  dirPath - The path to the directory to read files from.//+
 * @returns  A promise that resolves to an array of file objects.//+
 * Each object contains://+
 * - name: The name of the file.//+
 * - path: The full path to the file.//+
 * - extension: The file extension.//+
 */
export async function getFiles(dirPath: string) {
  try {
    if (!dirPath) {
      throw new Error("Directory path is required");
    }


    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    return entries
      .filter(entry => entry.isFile())
      .map(entry => ({
        name: entry.name.split(".")[0],
        path: join(dirPath, entry.name),
        extension: extname(entry.name)
      })) as FileEntry[];
  } catch (error) {
    Logger.error(`Failed to read directory ${dirPath}: ${error}`);
    return null
  }
}

export async function writeFile(dirPath: string, name: string, extension: string, data: Buffer | Uint8Array): Promise<boolean> {
  try {
    if (!name || !extension) {
      throw new Error("Name and extension are required");
    }
    if (!data) {
      throw new Error("Data is required");
    }
    if (!dirPath) {
      throw new Error("Directory path is required");
    }

    const fullPath = join(dirPath, `${name}.${extension}`);

    await fs.writeFile(fullPath, new Uint8Array(data));

    return true;
  } catch (error) {
    throw new Error(`Failed to write file:${error}`);
  }
}

export async function checkFileExists(dirPath: string, name: string, extension: string): Promise<boolean> {
  try {
    await fs.access(join(dirPath, `${name}.${extension}`));
    return true;
  } catch (error) {
    return false;
  }
}

export async function appendToFile(dirPath: string, name: string, type: FileType, extension: string, data: Buffer | Uint8Array) {
  try {
    if (!name || !extension) {
      throw new Error("Name and extension are required");
    }
    if (!data) {
      throw new Error("Data is required");
    }
    if (!dirPath) {
      throw new Error("Directory path is required");
    }

    const fullPath = join(dirPath, `${name}.${extension}`);

    let buffer: Buffer | Uint8Array | string | null = null;
    let encoding = "binary";

    switch (type) {
      case "document":
        buffer = data.toString()
        encoding = "utf-8"
        break;
      default:
        buffer = new Uint8Array(data)
        encoding = "binary"
        break;
    }

    await fs.appendFile(fullPath, buffer, {
      encoding: "binary",
    })

    return true;
  } catch (error) {
    throw new Error(`Failed to append ${name}:${error}`);
  }
}
