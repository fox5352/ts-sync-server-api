import request from 'supertest';
// local
import { app } from '../../app';
import { decrypt, encrypt } from "../../lib/crypto";
import { BaseResponse, Settings } from '../../types';


describe('API Test in settings route', () => {
  const token = 'testing';

  test('GET /api/settings', async () => {
    const response = await request(app).get("/api/settings");

    const encryptedData = response.body.encryptedData;

    expect(encryptedData).not.toBeNull();

    let decryptedData: any = decrypt(encryptedData, token);

    expect(decryptedData).not.toBeNull();

    expect(decryptedData?.encryptedData).not.toBeNull();

    decryptedData = decryptedData?.encryptedData as Settings;

    expect(decryptedData).toHaveProperty('allowList');
    expect(decryptedData.allowList).toBeInstanceOf(Array);

    expect(decryptedData).toHaveProperty('imagePaths');
    expect(decryptedData.imagePaths).toBeInstanceOf(Array);

    expect(decryptedData).toHaveProperty('audioPaths');
    expect(decryptedData.audioPaths).toBeInstanceOf(Array);

    expect(decryptedData).toHaveProperty('imageExt');

    expect(decryptedData).toHaveProperty('audioExt');
    expect(decryptedData.audioExt).toBeInstanceOf(Array);

    expect(decryptedData).toHaveProperty('server');
    expect(decryptedData.server).toBeInstanceOf(Object);

    expect(decryptedData.server).toHaveProperty('host');

    expect(decryptedData.server).toHaveProperty('port');
  });


  it('POST /api/settings - Update all settings', async () => {
    const testData = "testingUpadtedImagePath";

    let res: BaseResponse<Settings> | null = decrypt((await request(app).get("/api/settings")).body.encryptedData, token);

    if (!res) return

    const oldSettings: Settings | undefined = res.encryptedData;

    expect(oldSettings).not.toBeUndefined();

    let testSettings: Settings = JSON.parse(JSON.stringify(oldSettings));

    testSettings.imagePaths[0] = testData;


    // actual test here
    const response = (await request(app).post("/api/settings").send({
      encryptedData: encrypt(testSettings, token)
    }))

    expect(response.status).toBe(200);

    const data: BaseResponse<Settings> | null = decrypt(response.body.encryptedData, token);

    expect(data).not.toBeNull();

    // expect(data?.imagePaths[0]).toMatch(testData);

    console.log(testSettings)
    console.log(data?.encryptedData)
  });

})
