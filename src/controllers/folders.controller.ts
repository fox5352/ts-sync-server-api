import { Request, Response } from "express";
import { BaseResponse, Folder, Settings } from "../types";
import { getSettings } from "../lib/Settings";


export async function GET(_req: Request, res: Response) {
  const SETTINGS = getSettings();

  const allowedFileTypesList: string[] = SETTINGS.allowList;

  let data: Folder[] = allowedFileTypesList.map((fileType: string) => {
    let buffer: string[] = [];

    let propertyName = `${fileType}Paths`;

    if (propertyName in SETTINGS) {
      buffer = SETTINGS[propertyName as keyof Settings] as string[];
    }

    return {
      type: fileType,
      folders: buffer
    }
  })

  res.json({
    encryptedData: data,
    message: "Successfully fetched folders"
  } as BaseResponse<Folder[]>)
}


export async function POST(_req: Request, res: Response) {
  const TOKEN = process.env.TOKEN;

  if (!TOKEN) {
    res.status(500).json({
      message: "Erro token no found"
    } as BaseResponse<undefined>)
    return;
  }

  res.status(404).json({
    message: "Method on route not valid"
  } as BaseResponse<undefined>);
}
