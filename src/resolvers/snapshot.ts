import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { resize } from '../utils';
import { max } from '../constants.json';

export default async function resolve(address) {
  try {
    if (!process.env.HUB_HOST) throw new Error('HUB_HOST is not set');
    const url = `${process.env.HUB_HOST}/graphql`;

    const user = (
      await axios({
        url,
        method: 'post',
        data: {
          query: `
        query User {
          user(address: "${getAddress(address)}") {
            avatar
          }
        }
      `
        }
      })
    ).data.data.user;
    if (!user) throw new Error('User not found');
    if (!user.avatar) throw new Error('User avatar not set');

    const ipfsUrl = `https://cloudflare-ipfs.com/ipfs/${user.avatar.replace('ipfs://', '')}`;

    const input = (await axios({ url: ipfsUrl, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
