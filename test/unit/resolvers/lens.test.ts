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

    it('should resolve with address (default profile)', async () => {
      const result = await resolvers.lens('0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
