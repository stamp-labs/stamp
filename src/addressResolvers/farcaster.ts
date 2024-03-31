import { capture } from '@snapshot-labs/snapshot-sentry';
import { graphQlCall, Address, Handle, FetchError, isSilencedError, isEvmAddress } from './utils';

export const NAME = 'Farcaster';
const FNAMES_API_URL = 'https://fnames.farcaster.xyz/transfers?name=';
const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster/user/search';
const API_KEY = 'NEYNAR_API_DOCS'; // add api key on .env

interface User {
  username: string;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  pfp_url: string;
}

interface UserDetails {
  [address: string]: User[] | string;
}

async function fetchData(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { accept: 'application/json', api_key: API_KEY, ...options.headers } });
    if (!response.ok) {
        throw new Error(`Falha ao buscar dados da API. Status: ${response.status}`);
    }
    return response.json();
}

export async function lookupAddresses(addresses) {
    const results = {};
    const addressesQuery = addresses.join(',');

    try {
        const url = `${NEYNAR_API_URL}?addresses=${addressesQuery}`;
        const userDetails = await fetchData(url, {
            method: 'GET'
        });

        Object.entries(userDetails).forEach(([address, data]) => {
          if (Array.isArray(data) && data.length > 0) {
            const user = data[0];
            if ('username' in user && 'verified_addresses' in user && 'pfp_url' in user) {
              results[address] = {
                username: user.username,
                eth_addresses: user.verified_addresses.eth_addresses ?? [],
                sol_addresses: user.verified_addresses.sol_addresses ?? [],
                pfp_url: user.pfp_url
              };
            } else {
              console.warn(`Incomplete user data for address: ${address}`);
              results[address] = "Incomplete user data.";
            }
          } else {
            results[address] = "No user found for this address.";
          }
        });

        return results;
    } catch (error) {
        console.error(`Error fetching address details:`, error);
        throw new Error(`Error fetching address details.`);
    }
}

async function fetchUserDetailsByUsername(username) {
    try {
        const transferData = await fetchData(`${FNAMES_API_URL}${username}`);
        if (transferData.transfers.length > 0) {
            const fid = 197049; // using fid arbitrary to use neymar search api
            const userDetails = await fetchData(`${NEYNAR_API_URL}?q=${username}&viewer_fid=${fid}`, {
                method: 'GET',
            });
            if (userDetails.result && userDetails.result.users.length > 0) {
                const user = userDetails.result.users[0];
                return {
                    username: user.username,
                    verified_addresses: {
                        eth_addresses: user.verified_addresses.eth_addresses,
                        sol_addresses: user.verified_addresses.sol_addresses
                    },
                    pfp: user.pfp.url
                };
            }
        }
    } catch (error) {
        console.error(`Error fetching user details ${username}:`, error);
        throw new FetchError(`Error fetching user details ${username}.`);
    }
    return null;
}


export async function resolveNames(handles) {
    const results = {};

    for (const handle of handles) {
        const normalizedHandle = handle.includes('.fcast.id') ? handle.split('.fcast.id')[0] : handle;
        const userDetails = await fetchUserDetailsByUsername(normalizedHandle);
        if (userDetails) {
            results[handle] = {
                eth_addresses: userDetails.verified_addresses.eth_addresses,
                sol_addresses: userDetails.verified_addresses.sol_addresses,
                pfp_url: userDetails.pfp
            };
        } else {
            results[handle] = "User not found or error searching for details.";
        }
    }

    return results;
}
