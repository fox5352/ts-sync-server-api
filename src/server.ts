import dotenv from 'dotenv';
dotenv.config();
import http from 'node:http';
import { app } from './app';

import { getSettings } from './lib/Settings';
import { getIpAddress } from './lib/utils';

export const server = http.createServer(app);

const SETTINGS = getSettings();

server.listen(SETTINGS.server.port, SETTINGS.server.host, () => {
  let address = '';

  if (SETTINGS.server.host == "0.0.0.0") {
    address = `http://${getIpAddress()}:${SETTINGS.server.port}`
  } else {
    address = `http://localhost:${SETTINGS.server.port}`
  }
  console.log(`Server is running on ${address}`);
})
