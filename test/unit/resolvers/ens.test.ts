import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('ens', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.ens('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');

      expect(result).toBe(false);
    });

    it('should resolve', async () => {
      const result = await resolvers.ens('fabien.eth');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
