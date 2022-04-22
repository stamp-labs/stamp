import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { resize } from '../utils';
import { max } from '../constants.json';

export default async function resolve(address) {
  try {
    // TODO: add correct url for the hub
    const url = `http://localhost:8000/graphql`;

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

    // TODO: how to get the avatar from our own ipfs function
    // TODO: ipfs is naturally slow, so what should be the strategy as we wait for all the resolvers to resolve.
    const ipfsUrl = `https://ipfs.io/ipfs/${user.avatar.replace('ipfs://', '')}`;

    const input = (await axios({ url: ipfsUrl, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
