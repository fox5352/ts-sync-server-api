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
