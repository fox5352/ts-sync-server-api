import CryptoJS from 'crypto-js';
import Logger from './logger';

export function encrypt(data: any, token: string) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), token).toString();
}

export function decrypt<T>(data: any, token: string): T | null {
  try {
    const bytes = CryptoJS.AES.decrypt(data, token);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData ? (JSON.parse(decryptedData) as T) : null;
  } catch (error) {
    Logger.error(`${error}`);
    return null;
  }
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
}
