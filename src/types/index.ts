export type Result<T, E> = { ok: true; value: T } | { ok: false; value: E };

export interface ServerData {
  host: 'localhost' | '0.0.0.0';
  port: number;
}

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
