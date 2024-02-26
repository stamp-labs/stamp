import axios from 'axios';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';
import { fetchHttpImage, axiosDefaultParams } from './utils';

export default async function resolve(address: string) {
  try {
    if (!address.endsWith('.stark')) {
      throw new Error('Unsupported domain');
    }

    const res = await axios.get(
      `https://api.starknet.id/domain_to_data?domain=${address}`,
      axiosDefaultParams
    );
    const { img_url } = res.data;

    const input = await fetchHttpImage(getUrl(img_url));
    return await resize(input, max, max);
  } catch (e) {
    return false;
  }
}
