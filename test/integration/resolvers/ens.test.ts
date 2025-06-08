import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  jest.retryTimes(3);

  describe('ens', () => {
    it('should return false if avatar is not set', async () => {
      const result = await resolvers.ens('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');

      return expect(result).toBe(false);
    });

    it('should return false on invalid ENS name', async () => {
      const result = await resolvers.ens('snapshot-test.eth');

      return expect(result).toBe(false);
    }, 10e3);

    it('should resolve', async () => {
      const result = await resolvers.ens('fabien.eth');

      expect(result).toBeInstanceOf(Buffer);
      return expect(result.length).toBeGreaterThan(1000);
    }, 30e3);
  });
});
