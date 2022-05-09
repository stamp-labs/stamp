import * as AWS from '@aws-sdk/client-s3';
import { Readable } from 'stream';

let client;
const bucket = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const endpoint = process.env.AWS_ENDPOINT || undefined;
if (region) client = new AWS.S3({ region, endpoint });
const dir = 'stamp';

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
      Bucket: bucket,
      Key: `public/${dir}/${key}`,
      Body: value,
      ContentType: 'image/webp'
    });
  } catch (e) {
    console.log('Store cache failed', e);
    throw e;
  }
}

export async function clear(path) {
  try {
    const listedObjects = await client.listObjectsV2({
      Bucket: bucket,
      Prefix: `public/${dir}/${path}`
    });
    if (listedObjects.Contents.length === 0) return;
    const objs = listedObjects.Contents.map(obj => ({ Key: obj.key }));
    await client.deleteObjects({
      Bucket: bucket,
      Delete: { Objects: objs }
    });
    if (listedObjects.IsTruncated) await clear(path);
    return;
  } catch (e) {
    console.log('Clear cache failed', e);
    throw e;
  }
}

export async function get(key) {
  try {
    const { Body } = await client.getObject({
      Bucket: bucket,
      Key: `public/${dir}/${key}`
    });
    return Body;
  } catch (e) {
    return false;
  }
}
