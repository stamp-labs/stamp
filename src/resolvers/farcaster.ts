import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

const API_URL = 'https://far-users.vercel.app/api';

export default async function resolve(address) {
  try {
    const { data } = await axios({
      url: `${API_URL}/graphql`,
      method: 'post',
      data: {
        query: `
          query GetUsersByAddresses($address: String!) {
            getUserByAddress(address: ${address}) {
              fid
              username
              pfp_url
            }
          }`
      },
      ...axiosDefaultParams
    });

    const sourceUrl = data.data.pfp_url;
    if (!sourceUrl) return false;

    const url = getUrl(sourceUrl);
    const input = await fetchHttpImage(url);
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
