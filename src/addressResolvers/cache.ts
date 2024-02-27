import redis from '../helpers/redis';
import constants from '../constants.json';
import { addressResolversCacheHitCount } from '../helpers/metrics';

export const KEY_PREFIX = 'address-resolvers';

export async function getCache(keys: string[]): Promise<Record<string, string>> {
  if (!redis) return {};

  const transaction = redis.multi();
  keys.map(key => transaction.get(`${KEY_PREFIX}:${key}`));
  const results = await transaction.exec();

  return Object.fromEntries(
    keys.map((key, index) => [key, results[index]]).filter(([, value]) => value !== null)
  );
}

export function setCache(payload: Record<string, string>) {
  if (!redis) return;

  const transaction = redis.multi();
  Object.entries(payload).map(([key, value]) =>
    transaction.set(`${KEY_PREFIX}:${key}`, value || '', { EX: constants.ttl })
  );

  return transaction.exec();
}

export default async function cache(input: string[], callback) {
  const cache = await getCache(input);
  const cachedKeys = Object.keys(cache);
  const uncachedInputs = input.filter(a => !cachedKeys.includes(a));

  addressResolversCacheHitCount.inc({ status: 'MISS' }, uncachedInputs.length);
  addressResolversCacheHitCount.inc({ status: 'HIT' }, cachedKeys.length);

  if (uncachedInputs.length > 0) {
    const results = await callback(uncachedInputs);
    setCache(results);

    return { ...cache, ...results };
  }

  return cache;
}
