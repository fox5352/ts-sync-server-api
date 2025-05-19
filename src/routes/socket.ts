import { Socket } from "socket.io";
import Logger from "../lib/logger";
import { ErrorResponse, FileBuffer, Settings, UploadCompletePacket, UploadPacket } from "../types";
import { getSettings } from "../lib/Settings";
import { splitByLastDot } from "../lib/utils";
import { appendToFile, base64ToUint8Array, checkFileExists } from "../lib/fileManagement";

export const handleSocketConnection = (io: any): void => {
  io.on("connection", (socket: Socket) => {
    const handshakeDetails = socket.handshake;
    const origin = handshakeDetails.headers.origin;
    const timestamp = new Date().toISOString();
    Logger.log(`${origin} connected at ${timestamp}`);

    const fileBuffer: Record<string, FileBuffer | null> = {};

    socket.on("UPLOAD", async (obj: string) => {
      let parsedObj: UploadPacket;

      try {
        parsedObj = JSON.parse(obj);

        if (!parsedObj) {
          throw new Error("Invalid data received");
        }

        if (!parsedObj.id) {
          throw new Error("Invalid id data received");
        }

        const packetProperties: Array<keyof UploadPacket> = ["name", "type", "data", "packetIndex"];
        let errorMessage = "";

        for (let i = 0; i < packetProperties.length; i++) {
          const property = packetProperties[i];
          if (parsedObj[property] === undefined) errorMessage += `${property}, `;
        }

        if (errorMessage.length > 0) {
          throw new Error(`the following properties are missing in the packet: ${errorMessage}`);
        }

        const lastIndex = fileBuffer[parsedObj.id]?.endIndex > parsedObj.packetIndex
          ? fileBuffer[parsedObj.id]!.endIndex
          : parsedObj.packetIndex;

        fileBuffer[parsedObj.id] = {
          name: parsedObj.name,
          type: parsedObj.type,
          endIndex: lastIndex,
          buffer: {
            ...fileBuffer[parsedObj.id]?.buffer,
            [parsedObj.packetIndex]: parsedObj.data
          }
        };

      } catch (error) {
        console.error(error);
        socket.emit("error", {
          id: parsedObj?.id,
          message: `${error}`
        } as ErrorResponse);
      }
    });

    socket.on("UPLOAD_COMPLETE", async (obj: string) => {
      const SETTINGS: Settings = getSettings();
      let parsedObj: UploadCompletePacket;

      try {
        parsedObj = JSON.parse(obj);

        if (!parsedObj) {
          throw new Error("Invalid data received");
        }

        if (!parsedObj.id) {
          throw new Error("Invalid id data received");
        }

        const data = fileBuffer[parsedObj.id];

        if (!data) {
          throw new Error("failed to retrieve data by id");
        }

        const [fileType, _] = data.type.split("/");

        if (!fileType) {
          throw new Error("invalid fileType");
        }

        // TODO: get path from user later
        const pathType = `${fileType}Paths` as keyof Settings;

        if (!SETTINGS[pathType]) {
          throw new Error(`No paths found for file type ${fileType}`);
        }

        let selectedPath = "";

        if (parsedObj?.path) {
          console.log("data path found", parsedObj?.path);
          selectedPath = SETTINGS[pathType].find((val) => {
            return val === parsedObj?.path;
          }) || "";

          if (selectedPath.length === 0) {
            console.error(`No valid path found for file type ${fileType} and path ${parsedObj?.path}`);
            selectedPath = SETTINGS[pathType][0];
          }
        } else {
          console.log("default path selected");
          selectedPath = SETTINGS[pathType][0];
        }

        if (!selectedPath) {
          throw new Error(`No valid path found for file type ${fileType}`);
        }

        const [nameWithoutExtension, extension] = splitByLastDot(data.name);

        // check if file already exits
        const exists = await checkFileExists(selectedPath, nameWithoutExtension, extension);

        if (exists) {
          throw new Error("file already exists");
        }

        for (let idx = 0; data && idx < data.endIndex; idx++) {
          const uint8Buffer = base64ToUint8Array(data.buffer[idx]);
          const res = await appendToFile(selectedPath, nameWithoutExtension, fileType, extension, uint8Buffer);
          if (!res) throw new Error("failed to write file");
        }

        fileBuffer[parsedObj.id] = null; // clean up the buffer

        // TODO: maybe add a finish event
      } catch (error) {
        console.error(error);
        socket.emit("error", {
          id: parsedObj?.id,
          message: `${error}`
        } as ErrorResponse);
      }
    });

    socket.on("disconnect", () => {
      Logger.log(`${origin} disconnected at ${new Date().toISOString()}`);
    });
  });
};
