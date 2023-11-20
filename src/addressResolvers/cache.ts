import redis from '../helpers/redis';
import constants from '../constants.json';

const KEY = 'address-resolvers';

export async function getCache(keys: string[]): Promise<Record<string, string>> {
  if (!redis) return {};

  const transaction = redis.multi();
  keys.map(key => transaction.get(`${KEY}:${key}`));
  const results = await transaction.exec();

  return Object.fromEntries(
    keys.map((key, index) => [key, results[index]]).filter(([, value]) => value !== null)
  );
}

export function setCache(payload: Record<string, string>) {
  if (!redis) return;

  const transaction = redis.multi();
  Object.entries(payload).map(([key, value]) =>
    transaction.set(`${KEY}:${key}`, value || '', { EX: constants.ttl })
  );

  return transaction.exec();
}

export default async function cache(input: string[], callback) {
  const cache = await getCache(input);
  const cachedKeys = Object.keys(cache);

  const results = await callback(input.filter(a => !cachedKeys.includes(a)));
  setCache(results);

  return { ...cache, ...results };
}
