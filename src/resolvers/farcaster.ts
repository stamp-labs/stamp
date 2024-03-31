import axios from 'axios';
import { getAddress, isAddress } from '@ethersproject/address';
import { fetchHttpImage, axiosDefaultParams } from './utils';
import { getUrl, resize } from '../utils';
import { max } from '../constants.json';


const EXTERNAL_FARCASTER_API_URL = 'https://api.neynar.com'; 
const EXTERNAL_API_KEY = "NEYNAR_API_DOCS";


export default async function resolve(address) { 
    const eth_address = getAddress(address);
    if (!isAddress(address)) return false;
    
    try {
        let { data } = await axios({
            url: `${EXTERNAL_FARCASTER_API_URL}/v2/farcaster/user/bulk-by-address`,
            method: 'GET',
            params: {
                addresses: eth_address
            }, 
            headers: {accept: 'application/json', api_key: EXTERNAL_API_KEY},
            ...axiosDefaultParams
        })
        if (!data[Object.keys(data)[0]][0].pfp_url) return false;

        const url = getUrl(data[Object.keys(data)[0]][0].pfp_url);
        if (!url) return false;

        const input = await fetchHttpImage(url);
        
        return await resize(input, max, max);
    } catch (e) {
        return false;
    }
}