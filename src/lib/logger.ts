import os from 'node:os';
import { join } from 'node:path';
import { getAppDataPath, getCurrentDirectoryName } from './utils';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';

export default class Logger {
  public static DebugMode: boolean = process.env.DEBUG == 'true' ? true : false;

  static log(message: any) {
    if (!Logger.DebugMode) {
      console.log(message);
    } else {
      logToFile(`LOG:${message}`);
    }
  }

  static error(message: any | Error) {
    if (!Logger.DebugMode) {
      console.error(message);
    } else {
      logToFile(`ERROR:${message}`);
    }
  }
}

export function logToFile(message: string) {
  let appPath: string;

  switch (os.platform()) {
    case 'win32':
      appPath = join(getAppDataPath(), getCurrentDirectoryName());
      break;
    case 'linux':
      const homeDir = os.homedir(); // Get the home directory

      appPath = join(homeDir, '.local', 'share', 'sync-server-api');
      break;

    default:
      appPath = join(process.cwd(), getCurrentDirectoryName());
      break;
  }

  if (!existsSync(appPath)) {
    mkdirSync(appPath);
  }

  const logPath = join(appPath, 'sync-server-api.log');
  // TODO: add filesize management later
  appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
}
