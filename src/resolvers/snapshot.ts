import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { getIpfsUrl, resize } from '../utils';
import { max } from '../constants.json';

export default async function resolve(address) {
  try {
    if (!process.env.HUB_URL) throw new Error('HUB_URL is not set');
    const url = `${process.env.HUB_URL}/graphql`;

    const user = (
      await axios({
        url,
        method: 'post',
        data: {
          query: `query User { user(id: "${getAddress(address)}") { avatar } }`
        }
      })
    ).data.data.user;
    if (!user) throw new Error('User not found');
    if (!user.avatar) throw new Error('User avatar not set');

    const ipfsUrl = getIpfsUrl(user.avatar);
    const input = (await axios({ url: ipfsUrl, responseType: 'arraybuffer' })).data as Buffer;
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
