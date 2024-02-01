import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('trustwallet', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.trustwallet('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70', '');

      expect(result).toBe(false);
    });

    it('should resolve', async () => {
      const result = await resolvers.trustwallet('0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E', '');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
