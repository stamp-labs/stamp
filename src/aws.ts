import * as AWS from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const cb = 'stamp/13';

let client;
const region = process.env.AWS_REGION;
if (region) client = new AWS.S3({ region });

export async function streamToBuffer(stream: Readable) {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function set(key, value) {
  try {
    return await client.putObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `public/${cb}/${key}`,
      Body: value,
      ContentType: 'image/webp'
    });
  } catch (e) {
    console.log('Store cache failed', e);
    throw e;
  }
}

export async function get(key) {
  try {
    const { Body } = await client.getObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `public/${cb}/${key}`
    });
    return Body;
  } catch (e) {
    return false;
  }
}
