import * as AWS from '@aws-sdk/client-s3';
import { Readable } from 'stream';

let client;
const region = process.env.AWS_REGION;
const endpoint = process.env.AWS_ENDPOINT || undefined;
if (region) client = new AWS.S3({ region, endpoint });

export async function streamToBuffer(stream: Readable) {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function set(key, value, folder) {
  try {
    return await client.putObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `public/stamp/${folder}/${key}`,
      Body: value,
      ContentType: 'image/webp'
    });
  } catch (e) {
    console.log('Store cache failed', e);
    throw e;
  }
}

export async function remove(folder) {
  try {
    const Bucket = process.env.AWS_BUCKET_NAME;
    const listedObjects = await client.listObjectsV2({
      Bucket,
      Prefix: `public/stamp/${folder}`
    });

    if (listedObjects.Contents.length === 0) return;

    const Objects = [] as { Key: string }[];

    listedObjects.Contents.forEach(({ Key }) => {
      Objects.push({ Key });
    });

    await client.deleteObjects({
      Bucket,
      Delete: { Objects }
    });
    // If there are more files, it will delete them too
    if (listedObjects.IsTruncated) await remove(folder);
    return;
  } catch (e) {
    console.log('Remove cache failed', e);
    throw e;
  }
}

export async function get(key, folder) {
  try {
    const { Body } = await client.getObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `public/stamp/${folder}/${key}`
    });
    return Body;
  } catch (e) {
    return false;
  }
}
