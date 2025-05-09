import DotEnv from 'dotenv';
DotEnv.config();
import os from 'node:os';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { Settings } from '../types';
import Logger from './logger';
import { getAppDataPath, getCurrentDirectoryName } from './utils';

const DEBUG = process.env.DEBUG == 'true' ? true : false;

export function getSettings(): Settings {
  let appPath;

  if (DEBUG) {
    appPath = join(process.cwd());
  } else {
    // Check the operating system
    if (os.platform() === 'win32') {
      // Windows-specific path (keep your original logic)
      appPath = join(getAppDataPath(), getCurrentDirectoryName());
    } else {
      // Linux-specific path (user-writable directory)
      const homeDir = os.homedir(); // Get the home directory

      appPath = join(homeDir, '.local', 'share', 'sync-server-api');
    }
  }

  if (!existsSync(appPath)) {
    mkdirSync(appPath);
  }

  const settingsPath = join(appPath, 'settings.json');

  Logger.log(`Reading settings from: ${settingsPath}`);

  let allowList: string[] = [];

  let imagePaths: string[] = [];
  let imageExt = ['jpg', 'png'];

  let audioPaths: string[] = [];
  let audioExt = ['mp3'];

  let videoPaths: string[] = [];
  let videoExt = ['mkv', 'mp4'];

  let server = {
    host: '0.0.0.0',
    port: 9090,
  };

  try {
    const settings: Settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));

    return {
      allowList: settings.allowList || allowList,
      imagePaths: settings.imagePaths || imagePaths,
      audioPaths: settings.audioPaths || audioPaths,
      videoPaths: settings.videoPaths || videoPaths,
      imageExt: settings.imageExt || imageExt,
      audioExt: settings.audioExt || audioExt,
      videoExt: settings.videoExt || videoExt,
      server: settings.server || server,
    } as Settings;
  } catch (error) {
    Logger.error(`Failed to read settings: ${error}`);

    const defaultSettings = {
      allowList,
      imagePaths,
      audioPaths,
      videoPaths,
      imageExt,
      audioExt,
      videoExt,
      server,
    };

    writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2), 'utf-8');

    return getSettings();
  }
}

export function updateSettings(newSettings: Settings) {
  let appPath;

  if (DEBUG) {
    appPath = join(process.cwd());
  } else {
    // Check the operating system
    if (os.platform() === 'win32') {
      // Windows-specific path (keep your original logic)
      appPath = join(getAppDataPath(), getCurrentDirectoryName());
    } else {
      // Linux-specific path (user-writable directory)
      const homeDir = os.homedir(); // Get the home directory

      appPath = join(homeDir, '.local', 'share', 'sync-server-api');
    }
  }

  if (!existsSync(appPath)) {
    mkdirSync(appPath);
  }

  const settingsPath = join(appPath, 'settings.json');

  const oldSettings = getSettings();

  const updatedSettings = {
    ...oldSettings,
    ...newSettings,
  };

  try {
    writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2), 'utf-8');

    Logger.log(`Updated settings: ${JSON.stringify(updatedSettings, null, 2)}`);
    return true;
  } catch (error) {
    Logger.error(`Failed to update settings: ${error}`);
    return false;
  }
}
