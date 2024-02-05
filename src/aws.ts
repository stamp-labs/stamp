import * as AWS from '@aws-sdk/client-s3';
import { Readable } from 'stream';

let client;
const bucket = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const endpoint = process.env.AWS_ENDPOINT || undefined;
if (region) client = new AWS.S3({ region, endpoint });
const dir = 'stamp-3';

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function set(key: string, value: Buffer) {
  const command = new AWS.PutObjectCommand({
    Bucket: bucket,
    Key: `public/${dir}/${key}`,
    Body: value,
    ContentType: 'image/webp'
  });

  return await client.send(command);
}

export async function clear(path: string): Promise<boolean> {
  const listedObjects = await client.listObjectsV2({
    Bucket: bucket,
    Prefix: `public/${dir}/${path}`
  });
  if (!listedObjects.Contents || listedObjects.Contents.length === 0) return false;
  const objs = listedObjects.Contents.map(obj => ({ Key: obj.Key }));
  await client.deleteObjects({
    Bucket: bucket,
    Delete: { Objects: objs }
  });
  if (listedObjects.IsTruncated) await clear(path);
  return true;
}

export async function get(key: string): Promise<Readable | boolean> {
  try {
    const command = new AWS.GetObjectCommand({
      Bucket: bucket,
      Key: `public/${dir}/${key}`
    });

    return (await client.send(command)).Body;
  } catch (e) {
    return false;
  }
}
