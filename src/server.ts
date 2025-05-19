import dotenv from 'dotenv';
dotenv.config();
import http from 'node:http';
import { app } from './app';
import { Server } from "socket.io"

import { getSettings } from './lib/Settings';
import { getIpAddress } from './lib/utils';
import Logger from './lib/logger';
import { handleSocketConnection } from './routes/socket';

export const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const SETTINGS = getSettings();

if (process.env.TOKEN == undefined) throw new Error("token not found");

handleSocketConnection(io)

server.listen(SETTINGS.server.port, SETTINGS.server.host, () => {
  let address = '';

  if (SETTINGS.server.host == "0.0.0.0") {
    address = `http://${getIpAddress()}:${SETTINGS.server.port}`
  } else {
    address = `http://localhost:${SETTINGS.server.port}`
  }
  console.log(`Server is running on ${address}`);
})
