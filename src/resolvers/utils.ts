import axios from 'axios';
import http from 'http';
import https from 'https';

export async function fetchHttpImage(url: string, options = {}): Promise<Buffer> {
  return (
    await axios({
      url,
      ...{
        responseType: 'arraybuffer',
        timeout: 5e3,
        ...options
      }
    })
  ).data;
}

export const axiosDefaultParams = {
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  timeout: 5e3
};
