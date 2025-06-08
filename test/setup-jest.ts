// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(console, 'log').mockImplementation(() => {});

import client from '../src/helpers/redis';

afterAll(async () => {
  if (client) {
    await client.flushDb();
    await client.quit();
  }
});
