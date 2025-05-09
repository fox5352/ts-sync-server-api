import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { decrypt, encrypt } from './lib/crypto';
import Logger from './lib/logger';
import { BaseResponse } from './types';
import { homeRouter } from './routes/home.route';
import { foldersRouter } from './routes/folders.route';


if (!process.env.TOKEN) throw new Error("NO TOKEN")

const app = express();

app.use(morgan('combind'));

app.use(
  cors({
    origin: '*', // TODO: maybe add the origin to the settings
  }),
);

app.use(
  express.json({
    limit: '3gb', // TODO: maybe add the size limit to the settings file
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(async function(req, res, next) {
  const TOKEN = process.env.TOKEN;

  if (!TOKEN) {
    res.status(500).json({
      message: 'Token not found',
    } as BaseResponse<undefined>);
    return;
  }

  try {
    //
    // ===========================
    // 🔽 REQUEST HANDLING (INCOMING)
    // ===========================
    //
    if (req.body) {
      const encryptedData = req.body.encryptedData;

      if (!encryptedData)
        throw new Error(
          "Request body is present, but missing the required 'encryptedData' property.",
        );

      const decryptedData = decrypt<unknown>(encryptedData, TOKEN);

      if (!decryptedData) throw new Error('Decryption failed');

      if (!decryptedData || typeof decryptedData !== 'object' || Array.isArray(decryptedData)) {
        throw new Error('Decrypted data is invalid or not an object.');
      }

      req.body = decryptedData;
    }
  } catch (error) {
    Logger.log(`Error decrypting data: ${error}`);
    res.status(400).json({
      message: error,
    } as BaseResponse<undefined>);
  }

  //
  // ===========================
  // 🔼 RESPONSE HANDLING (OUTGOING)
  // ===========================
  //
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    try {
      return originalJson({ encryptedData: encrypt(data, TOKEN) }); // Wrap in an object
    } catch (error) {
      return originalJson({ encryptedData: encrypt({ message: 'Error encrypting response.' }, TOKEN) });
    }
  };

  // Move on to the next middleware or route handler
  next();
});

app.use('/', homeRouter);

app.use('/', foldersRouter);

export { app };
