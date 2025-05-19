import { Request, Response } from "express";
import { BaseResponse, DetailedFileData, FileEntry, FilesData, FileType, Settings } from "../types";
import { getSettings } from "../lib/Settings";
import { getFileMetadata, getFiles, readFileData } from "../lib/fileManagement";



export async function GET(req: Request, res: Response): Promise<void> {
  const fileType: string = req.params.filetype;

  const query = req.query;

  const name = query.name as string;
  const queryPath = query.path as string;

  const decodedName = decodeURIComponent(name);
  const decodedPath = decodeURIComponent(queryPath)

  if (!decodedName || !decodedPath) {
    res.status(400).json({ message: "Invalid request payload requires both name and path in query" })
  }


  try {
    const SETTINGS: Settings = getSettings();

    const pathsList = SETTINGS[`${fileType}Paths` as keyof Settings] as string[];

    if (!pathsList) {
      throw new Error("failed to get paths list");
    }

    for (const path of pathsList) {
      const files = await getFiles(path);

      if (files) {
        if (files.length == 0) throw new Error("no files found");

        for (const file of files) {
          if (file.name == decodedName || file.name.toLowerCase().includes(decodedName)) {
            if (file.path == decodedPath) {
              const metaData = await getFileMetadata(file.path, fileType as FileType);
              const fileBuffer = await readFileData(file.path);

              res.json({
                message: "file fetched successfully",
                encryptedData: {
                  ...file,
                  metaData, data: fileBuffer
                }
              } as BaseResponse<DetailedFileData>)
            }
          }
        }

      }
    }

  } catch (error) {
    res.status(500).json({
      message: `Internal Server Error on attempt ${fileType} fetch in file route`
    })
  }


}
