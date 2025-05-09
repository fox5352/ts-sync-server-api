import dotenv from 'dotenv';
import { BaseResponse, HomeObj } from '../types';
import { encrypt } from '../lib/crypto';
import { Request, Response } from 'express';
dotenv.config();

export async function GET(_req: Request, res: Response) {
  const TOKEN = process.env.TOKEN;

  if (!TOKEN) {
    res.status(500).json({
      message: 'TOKEN not found',
    } as BaseResponse<undefined>);
    return;
  }

  res.json({
    message: 'success',
    encryptedData: {
      routes: [
        { path: '/api/folders', desc: 'shows list of available folders', methods: ['GET'] },
        { path: '/api/:filetype', desc: 'shows files of a given type', methods: ['GET', 'POST'] },
        {
          path: '/api/:filetype/file',
          desc: 'retrieves a specific file',
          methods: ['GET', 'POST'],
        },
        { path: '/api/settings', desc: 'updates system settings', methods: ['GET', 'POST'] },
      ],
    }
  } as BaseResponse<HomeObj>);
}

export async function POST(_req: Request, res: Response) {
  const TOKEN = process.env.TOKEN;

  if (!TOKEN) {
    res.status(500).json({
      message: 'TOKEN not found',
    } as BaseResponse<undefined>);
    return;
  }

  res.status(404).json({
    message: 'Method not supported on this route'
  } as BaseResponse<undefined>);
}
