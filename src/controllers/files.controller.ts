import { Request, Response } from "express";
import { getSettings } from "../lib/Settings";
import { BaseResponse, FileEntry, FilesData, FileType, Settings } from "../types";
import Logger from "../lib/logger";
import { getFileMetadata, getFiles, writeFile } from "../lib/fileManagement";

// helpers
function getFolderName(path: string): string {
  const splitPath = path.trim().split(/[\/\\]/).filter(item => item !== "");

  const folderName = splitPath[splitPath.length - 1]

  return folderName == "." ? "root" : folderName;
}

export async function GET(req: Request, res: Response): Promise<void> {
  const fileType = req.params.filetype;

  const buffer: FilesData[] = [];

  try {
    const SETTINGS = getSettings();

    const pathKey = `${fileType}Paths` as keyof Settings;

    if (!pathKey) throw new Error("invalid file type");

    const pathsList = SETTINGS[pathKey] as string[];

    if (!pathsList) throw new Error("failed to find paths for file type");

    for (const path of pathsList) {
      // TODO: finish later
      const files = await getFiles(path);

      if (!files) throw new Error("failed to get files");

      let filteredFiles: FileEntry[] = files
        .filter(item => {
          switch (fileType) {
            case "audio": {
              return SETTINGS.audioExt.includes(item.extension.replace(".", "").toLowerCase()) ? true : false;
            } case "image": {
              return SETTINGS.imageExt.includes(item.extension.replace(".", "").toLowerCase()) ? true : false;
            } case "video": {
              return SETTINGS.videoExt.includes(item.extension.replace(".", "").toLowerCase()) ? true : false;
            }
            default:
              return false;
          }
        })

      for (let i = 0; i < filteredFiles.length; ++i) {
        const fileMetaData = await getFileMetadata(filteredFiles[i].path, fileType as FileType);

        if (filteredFiles[i]) {
          filteredFiles[i].metaData = fileMetaData
        }
      }


      const folderName = getFolderName(path);

      buffer.push({
        folderName,
        data: filteredFiles
      })
    }

    res.json({
      message: "successfully fetched data from file path",
      encryptedData: buffer
    } as BaseResponse<FilesData[]>);
  } catch (error) {
    Logger.error(`${error}`);
    res.status(500).json({
      message: `failed to get ${fileType} files`
    } as BaseResponse<undefined>);
  }
}

export async function POST(req: Request, res: Response): Promise<void> {

  const fileType = req.params.filetype;

  const { data, name, type }: { data: any, name: string, type: string } = req.body;


  if (!data || !name || !type) {
    res.status(400).json({ message: "Invalid request payload" } as BaseResponse<undefined>)

  }

  const [_, ext] = type.split("/")

  try {
    const SETTINGS = getSettings();

    switch (fileType) {
      case "audio": {
        // TODO: add path select bt query in future
        await writeFile(SETTINGS.audioPaths[0] || "./", name, ext, data)
        break;
      } case "image": {
        // TODO: add path select bt query in future
        await writeFile(SETTINGS.imagePaths[0] || "./", name, ext, data)
        break;
      } case "video": {
        // TODO: add path select bt query in future
        await writeFile(SETTINGS.videoPaths[0] || "./", name, ext, data)
        break;
      } default: {
        res.status(403).json({ message: "Invalid file type" });
        break;
      }
    }

    res.json({ message: "file saved successfully" } as BaseResponse<undefined>)
  } catch (error) {
    Logger.error(`failed to save ${error}`)
    res.status(500).json({
      message: "failed to save file" + error
    } as BaseResponse<undefined>)
  }
}
