import { Address, Handle } from './utils';
import redis from '../helpers/redis';
import constants from '../constants.json';

const KEY = 'address-resolvers';

export async function getCache(addresses: Address[]): Promise<Record<Address, Handle>> {
  if (!redis) return {};

  const transaction = redis.multi();
  addresses.map(address => {
    transaction.get(`${KEY}:${address}`);
  });
  const results = await transaction.exec();

  return Object.fromEntries(
    addresses
      .map((address, index) => [address, results[index]])
      .filter(([, handle]) => handle !== null)
  );
}

export function setCache(payload: Record<Address, Handle>) {
  if (!redis) return;

  const transaction = redis.multi();
  Object.entries(payload).map(([address, handle]) =>
    transaction.set(`${KEY}:${address}`, handle, { EX: constants.ttl })
  );

  return transaction.exec();
}

export default async function cache(addresses: Address[], callback) {
  const cache = await getCache(addresses);
  const cachedAddresses = Object.keys(cache);

  const results = await callback(addresses.filter(a => !cachedAddresses.includes(a)));
  setCache(results);

  return { ...cache, ...results };
}
