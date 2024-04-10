import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('lens', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.lens('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');

      expect(result).toBe(false);
    });

    it('should resolve with handle', async () => {
      const result = await resolvers.lens('fabien.lens');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });

    it('should resolve with address', async () => {
      const result = await resolvers.lens('0xeF8305E140ac520225DAf050e2f71d5fBcC543e7');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});

