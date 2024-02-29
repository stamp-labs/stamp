import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('snapshot', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.snapshot('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');

      expect(result).toBe(false);
    }, 15e3);

    it('should resolve', async () => {
      const result = await resolvers.snapshot('0xeF8305E140ac520225DAf050e2f71d5fBcC543e7');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    }, 15e3);
  });
});
