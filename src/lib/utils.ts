import DotEnv from 'dotenv';
DotEnv.config();
import path from 'node:path';
import os from 'node:os';

const DEBUG = process.env.DEBUG == 'true' ? true : false;

export function getCurrentDirectoryName(): string {
  // @ts-ignore
  const runningDir = process.pkg ? path.dirname(process.execPath) : process.cwd();
  return path.basename(runningDir);
}

/**
 * @returns {string} a path to the appData folder if its linux or windows other wise it'll just return cwd
 */
export function getAppDataPath(): string {
  const homeDir = os.homedir();

  if (process.platform == 'win32') {
    return path.join(homeDir, 'AppData', 'Roaming');
  } else if (process.platform == 'linux') {
    return path.join(homeDir, '.config');
  } else {
    return path.join(process.cwd());
  }
}

export function getIpAddress(): string | null {
  const interfaces = os.networkInterfaces();

  for (const key in interfaces) {
    const interfaceDetails = interfaces[key];
    if (interfaceDetails) {
      // Ensure interfaceDetails is not undefined
      for (const details of interfaceDetails) {
        if (details.family === 'IPv4' && !details.internal) {
          return details.address;
        }
      }
    }
  }

  return null;
}

export function splitByLastDot(str: string): [string, string | null] {
  const lastDotIndex = str.lastIndexOf('.');
  if (lastDotIndex === -1) return [str, null]; // no dot found
  const before = str.slice(0, lastDotIndex);
  const after = str.slice(lastDotIndex + 1);
  return [before, after];
}
