import { Address, Handle } from './utils';
import redis from '../helpers/redis';

const KEY = 'address-resolvers';
const TTL = 24 * 60 * 60 * 1e3;

export async function getCache(addresses: Address[]): Promise<Record<Address, Handle>> {
  const transaction = redis.multi();
  addresses.map(address => {
    transaction.get(`${KEY}:${address}`);
  });
  const results = await transaction.exec();

  return Object.fromEntries(
    addresses
      .map((address, index) => {
        return [address, results[index]];
      })
      .filter(([, handle]) => handle !== null)
  );
}

export function setCache(payload: Record<Address, Handle>) {
  const transaction = redis.multi();
  Object.entries(payload).map(([address, handle]) => {
    transaction.set(`${KEY}:${address}`, handle, { EX: TTL });
  });

  return transaction.exec();
}

export default async function cache(addresses: Address[], callback) {
  const cache = await getCache(addresses);
  const cachedAddresses = Object.keys(cache);

  const results = await callback(addresses.filter(a => !cachedAddresses.includes(a)));
  await setCache(results);

  return { ...cache, ...results };
}
