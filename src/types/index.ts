export type Result<T, E> = { ok: true; value: T } | { ok: false; value: E };

export interface ServerData {
  host: 'localhost' | '0.0.0.0';
  port: number;
}

export type FileType = "audio" | "image" | "video" | "document";

export interface Settings {
  allowList: string[];
  imagePaths: string[];
  imageExt: string[];
  audioPaths: string[];
  audioExt: string[];
  videoPaths: string[];
  videoExt: string[];
  server: ServerData;
}

export interface BaseResponse<T> {
  message: string;
  encryptedData?: T;
}

export interface BaseRequest {
  encryptedData: string;
}

export type Methods = 'GET' | 'POST';


// file management
export interface AudioMetaData {
  duration?: number;
  sampleRate?: number;
}

export interface ImageMetaData {
  thumbnail?: Buffer
}

export interface FileMetaData {
  size: number,
  created: Date,
  modified: Date
  imageMetaData?: ImageMetaData
  audioMetaData?: AudioMetaData
}

export interface FileEntry {
  name: string,
  path: string,
  extension: string,
  metaData?: FileMetaData
}

// home route
export type PathAndDec = {
  path: string;
  desc: string;
  methods: Methods[];
};

export interface HomeObj {
  routes: PathAndDec[];
}

export interface Folder {
  type: string;
  folders: string[];
}

// files route
//
export interface FilesData {
  folderName: string;
  data: FileEntry[];
}

// file route

export interface DetailedFileData extends FileEntry {
  data: Buffer;
}

// socket

import { Server } from 'socket.io';

/**
 * Interface for the file buffer stored during upload
 */
export interface FileBuffer {
  name: string;
  type: string;
  endIndex: number;
  buffer: {
    [packetIndex: number]: string;
  };
}

/**
 * Interface for upload packet data
 */
export interface UploadPacket {
  id: string;
  name: string;
  type: string;
  data: string;
  packetIndex: number;
}

/**
 * Interface for upload complete packet data
 */
export interface UploadCompletePacket {
  id: string;
  path?: string;
}

/**
 * Interface for error response data
 */
export interface ErrorResponse {
  id?: string;
  message: string;
}

/**
 * Interface for settings configuration
 */
export interface Settings {
  [key: string]: string[];
  imagePaths: string[];
  videoPaths: string[];
  audioPaths: string[];
  applicationPaths: string[];
  textPaths: string[];
}

/**
 * Helper utility function types
 */
export interface Utils {
  logToFile: (message: string) => void;
  getSettings: () => Settings;
  splitByLastDot: (filename: string) => [string, string];
  checkFileExists: (path: string, name: string, extension: string) => Promise<boolean>;
  base64ToUint8Array: (base64String: string) => Uint8Array;
  appendToFile: (
    path: string,
    name: string,
    fileType: string,
    extension: string,
    data: Uint8Array
  ) => Promise<boolean>;
}

/**
 * Socket IO interface
 */
export interface SocketHandler {
  handleSocketConnection: (io: Server) => void;
}
