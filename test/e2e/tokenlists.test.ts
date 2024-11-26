import sharp from 'sharp';
import axios from 'axios';
import crypto from 'crypto';

const HOST = `http://localhost:${process.env.PORT || 3003}`;
const cUSDC_TOKEN_ADDRESS_ON_MAIN = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';
const ERC3770_ADDRESS = 'oeth:0xe0BB0D3DE8c10976511e5030cA403dBf4c25165B';
const EIP155_ADDRESS = 'eip155:1:0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';

function getImageFingerprint(input: string) {
  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex');
}

function getImageResponse(identifier: string) {
  return axios.get(`${HOST}/token/${identifier}?resolver=tokenlists`, {
    responseType: 'arraybuffer',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0'
    }
  });
}

// tokenlists resolver needs a moment on first run
// there's probably a better way to handle this
jest.setTimeout(60_000);

describe('tokenlist resolver', () => {
  it('returns an image for standard address', async () => {
    const response = await getImageResponse(cUSDC_TOKEN_ADDRESS_ON_MAIN);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/webp');
  });

  it('returns correct image for ERC3770 address', async () => {
    const response = await getImageResponse(ERC3770_ADDRESS);

    const image = sharp(response.data);
    const imageBuffer = await image.raw().toBuffer();

    const fingerprint = getImageFingerprint(imageBuffer.toString('hex'));
    const expectedFingerprint = 'ac601f072065d4d03e6ef906c1dc3074d7ad52b9c715d0db6941ec89bf2073a1';

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/webp');
    expect(fingerprint).toBe(expectedFingerprint);
  });

  it('returns an image for EIP155 address', async () => {
    const response = await getImageResponse(EIP155_ADDRESS);

    const image = sharp(response.data);
    const imageBuffer = await image.raw().toBuffer();

    const fingerprint = getImageFingerprint(imageBuffer.toString('hex'));
    const expectedFingerprint = '8118786398e4756b2b7e8e224ec2bb5cbe3b26ee93ceff3b19d40f81c8ce45a2';

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/webp');
    expect(fingerprint).toBe(expectedFingerprint);
  });
});
