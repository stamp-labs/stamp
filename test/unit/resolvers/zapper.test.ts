import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('zapper', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.zapper('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70', '');

      expect(result).toBe(false);
    });

    it('should resolve', async () => {
      const result = await resolvers.zapper('0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', '');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
