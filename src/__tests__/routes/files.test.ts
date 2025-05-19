import request from "supertest";

import { app } from "../../app";
import { BaseRequest, BaseResponse, FileEntry, Folder } from "../../types";
import { decrypt, encrypt } from "../../lib/crypto";

describe('API Test in files route', () => {
  const token = 'testing';


  test('GET /api:audio', async () => {
    const response = await request(app).get("/api/audio");

    expect(response.status).toBe(200);

    const encryptedData: string = response.body.encryptedData;
    const fileData: BaseResponse<FileEntry[]> | null = decrypt(encryptedData, token);


    expect(fileData).not.toBeNull();

    expect(fileData).toHaveProperty('message');
    expect(fileData?.message).toMatch("successfully fetched data from file path");
  })

  test('GET /api:image', async () => {
    const response = await request(app).get("/api/image");

    expect(response.status).toBe(200);

    const encryptedData: string = response.body.encryptedData;
    const fileData: BaseResponse<FileEntry[]> | null = decrypt(encryptedData, token);


    expect(fileData).not.toBeNull();

    expect(fileData).toHaveProperty('message');
    expect(fileData?.message).toMatch("successfully fetched data from file path");

  })

  test('POST /api:audio', async () => {
    const token = "testing";
    const body = { data: "0001010101", name: "testing", type: "audio/mp3" };
    //
    const validPayload: BaseRequest = {
      encryptedData: encrypt(body, token)
    };

    const response = await request(app).post("/api/audio").send(validPayload);

    expect(response.status).toBe(200)

    const encryptedData: string = response.body.encryptedData;

    const resData: BaseResponse<undefined> | null = decrypt(encryptedData, token);

    expect(resData).not.toBeNull();

    expect(resData).toHaveProperty('message');
    expect(resData?.message).toBe("file saved successfully");
  });

  test('POST /api:image', async () => {
    const token = "testing";
    const body = { data: "0001010101", name: "testingss", type: "image/jpg" };
    const validPayload: BaseRequest = {
      encryptedData: encrypt(body, token)
    };

    const response = await request(app).post("/api/image").send(validPayload);

    expect(response.status).toBe(200)

    const encryptedData: string = response.body.encryptedData;

    const resData: BaseResponse<undefined> | null = decrypt(encryptedData, token);

    expect(resData).not.toBeNull();

    expect(resData).toHaveProperty('message');
    expect(resData?.message).toBe("file saved successfully");
  });
})
