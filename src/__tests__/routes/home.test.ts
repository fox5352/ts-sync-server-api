import request from 'supertest';
// local
import { app } from '../../app';
import { decrypt, encrypt } from "../../lib/crypto";
import { BaseResponse, HomeObj } from "../../types";

describe('Home Routes', () => {
  it('GET /', async () => {
    const token = 'testing';

    const response = await request(app).get('/');

    expect(response.status).toBe(200);

    const body: BaseResponse<string> = response.body

    const payload: BaseResponse<HomeObj> | null = decrypt<BaseResponse<HomeObj>>(body.encryptedData, token);

    expect(payload).not.toBeNull();

    if (!payload) return;

    expect(payload.message).toMatch('success');
    expect(payload.encryptedData)
      .toEqual({
        "routes": [
          {
            "path": "/api/folders",
            "desc": "shows list of available folders",
            "methods": ["GET"]
          },
          {
            "path": "/api/:filetype",
            "desc": "shows files of a given type",
            "methods": ["GET", "POST"]
          },
          {
            "desc": "retrieves a specific file",
            "methods": [
              "GET",
              "POST",
            ],
            "path": "/api/:filetype/file",
          }, {
            "desc": "updates system settings",
            "methods": [
              "GET",
              "POST",
            ],
            "path": "/api/settings",
          }
        ]
      });

  });

  it('POST /', async () => {
    const token = 'testing';
    const validPayload = encrypt({ testing: "payload" }, token);

    const response = await request(app).post('/').send({ encryptedData: validPayload });
    expect(response.status).toBe(404);
  });
});
