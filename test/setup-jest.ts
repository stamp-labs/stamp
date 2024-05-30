import client from '../src/helpers/redis';

afterAll(async () => {
  if (client) {
    await client.flushDb();
    await client.quit();
  }
});
