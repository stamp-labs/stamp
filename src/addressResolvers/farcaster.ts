import { capture } from '@snapshot-labs/snapshot-sentry';
import { graphQlCall, Address, Handle, FetchError, isSilencedError, isEvmAddress } from './utils';
import { getAddress } from 'viem';

export const NAME = 'Farcaster';
const FNAMES_API_URL = 'https://fnames.farcaster.xyz/transfers?name=';
const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster/user/';
const API_KEY = process.env.NEYNAR_API_KEY ?? '';

interface UserDetails {
  username: Handle;
  verified_addresses: {
    eth_addresses: Address[];
    sol_addresses: string[];
  };
  pfp_url: string;
}

interface ApiResponse {
  [address: string]: UserDetails[];
}

interface UserResult {
  username?: Handle;
  eth_addresses?: Address[];
  sol_addresses?: string[];
  pfp_url?: string;
}

export async function fetchData<T>(url: string): Promise<T> {
  const headers = {
    Accept: 'application/json',
    api_key: API_KEY
  };
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const error = new FetchError(`Failed to fetch data from the API. Status: ${response.status}`);
    if (!isSilencedError(error)) {
      capture(error, { tags: { issue: 'api_fetch_failure' } });
    }
    throw error;
  }
  return response.json() as Promise<T>;
}


export async function lookupAddresses(addresses: Address[]): Promise<{ [key: Handle]: Address }> {
  const results: { [key: Handle]: Address } = {};
  try {
    const addressesQuery = addresses.join(',');
    const url = `${NEYNAR_API_URL}bulk-by-address?addresses=${addressesQuery}`;
    const userDetails = await fetchData<ApiResponse>(url);

    for (const [address, data] of Object.entries(userDetails)) {
      if (Array.isArray(data) && data.length > 0 && data[0].username) {
        const checksumAddress = getAddress(address);
        results[checksumAddress] = data[0].username + '.fcast.id';
      } else {
        results[address] = 'No user found for this address.';
      }
    }
  } catch (error) {
    if (!isSilencedError(error)) {
      capture(error, { input: { addresses }, tags: { issue: 'lookup_addresses_failure' } });
    }
    throw new FetchError('Error fetching address details.');
  }
  return results;
}


export async function fetchUserDetailsByUsername(username: Handle): Promise<UserResult | null> {
  try {
    const transferData = await fetchData<{ transfers: any[] }>(`${FNAMES_API_URL}${username}`);
    if (transferData.transfers.length > 0) {
      const userDetails = await fetchData<{ result: { users: UserDetails[] } }>(
        `${NEYNAR_API_URL}search?q=${username}&viewer_fid=197049`
      );
      if (userDetails.result && userDetails.result.users.length > 0) {
        const user = userDetails.result.users[0];
        const eth_addresses_checksummed = user.verified_addresses.eth_addresses.filter(
          isEvmAddress
        );

        return {
          username: user.username,
          eth_addresses: eth_addresses_checksummed,
          sol_addresses: user.verified_addresses.sol_addresses,
          pfp_url: user.pfp_url
        };
      }
    }
  } catch (error) {
    if (!isSilencedError(error)) {
      capture(error, { input: { username }, tags: { issue: 'fetch_user_details_failure' } });
    }
    throw new FetchError(`Error fetching user details for ${username}.`);
  }
  return null;
}


export async function resolveNames(handles: Handle[]): Promise<Record<Handle, Address>> {
  const results: Record<Handle, Address> = {};
  for (const handle of handles) {
    const normalizedHandle = handle.replace('.fcast.id', '');
    const userDetails = await fetchUserDetailsByUsername(normalizedHandle);

    if (userDetails && userDetails.eth_addresses && userDetails.eth_addresses.length > 0) {
      const checksumAddress = getAddress(userDetails.eth_addresses[0]);
      results[handle] = checksumAddress;
    }

  }
  return results;
}



