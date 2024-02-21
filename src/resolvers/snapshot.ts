import axios from 'axios';
import { getAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

const HUB_URL = process.env.HUB_URL || 'https://hub.snapshot.org';

export default async function resolve(address) {
  try {
    const user = (
      await axios({
        url: `${HUB_URL}/graphql`,
        method: 'post',
        data: {
          query: `query { user(id: "${getAddress(address)}") { avatar } }`
        },
        ...axiosDefaultParams
      })
    ).data.data.user;
    if (!user || !user.avatar) return false;
    const url = getUrl(user.avatar);
    const input = await fetchHttpImage(url);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
