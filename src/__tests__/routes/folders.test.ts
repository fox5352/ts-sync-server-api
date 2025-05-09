import request from "supertest";

import { app } from "../../app";
import { BaseResponse, Folder } from "../../types";
import { decrypt, encrypt } from "../../lib/crypto";

describe('API Test in folders route', () => {
  const block = request(app);
  const token = 'testing';

  test('GET /api/folders', async () => {
    const response = await block.get("/api/folders");

    expect(response.status).toBe(200);

    const body: string | null = response.body.encryptedData;

    expect(body).not.toBeNull();

    const payload: BaseResponse<Folder[]> | null = decrypt(body, token);

    expect(payload).toHaveProperty('encryptedData');
    expect(payload).toHaveProperty('message');

    expect(payload?.encryptedData).toBeInstanceOf(Array);
    expect(payload?.message).toBe("Successfully fetched folders");
  })

  test('POST /api/folders', async () => {
    const token = 'testing';
    const validPayload = encrypt({ testing: "payload" }, token);
    const response = await block.post("/api/folders").send({ encryptedData: validPayload });


    expect(response.status).toBe(404);
  });
})
