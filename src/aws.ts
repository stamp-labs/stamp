import * as AWS from '@aws-sdk/client-s3';

const cb = 'stamp/6';

let client;
const region = process.env.AWS_REGION;
if (region) client = new AWS.S3({ region });

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
