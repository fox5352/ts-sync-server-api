import dotenv from "dotenv";
dotenv.config();

import { getSettings, updateSettings } from "../lib/Settings"
import { Request, Response } from "express";
import Logger from "../lib/logger";
import { BaseResponse, Settings } from "../types";

export async function GET(_req: Request, res: Response) {
  try {
    const settings: Settings = getSettings();


    res.json({
      message: "successfully retrieve settings",
      encryptedData: settings
    } as BaseResponse<Settings>)
  } catch (error) {
    Logger.error(`${error}`)
    res.status(500).json({
      message: "failed to get settings from server"
    } as BaseResponse<undefined>)
  }

}


export async function POST(req: Request, res: Response) {
  const updatedSettings = req.body.settings;

  try {
    const settings = getSettings();

    const newSettings: Settings = {
      ...settings,
      ...updatedSettings
    };


    updateSettings(newSettings);

    res.json({
      encryptedData: newSettings,
      message: "Settings updated successfully"
    } as BaseResponse<Settings>)
  } catch (error) {
    Logger.error(`${error}`);
    res.status(500).json({
      message: `"Failed to update settings`
    } as BaseResponse<undefined>)
  }
}
