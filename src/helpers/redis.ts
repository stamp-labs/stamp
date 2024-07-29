import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | undefined;

(async () => {
  if (!process.env.REDIS_URL) return;

  console.log('[redis] Connecting to Redis');
  client = createClient({ url: process.env.REDIS_URL });
  client.on('connect', () => console.log('[redis] Redis connect'));
  client.on('ready', () => console.log('[redis] Redis ready'));
  client.on('reconnecting', err => console.log('[redis] Redis reconnecting', err));
  client.on('error', err => console.log('[redis] Redis error', err));
  client.on('end', () => console.log('[redis] Redis end'));
  await client.connect();
})();

export default client;
