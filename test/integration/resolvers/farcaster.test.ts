import resolvers from '../../../src/resolvers';

describe('farcaster', () => {
  describe('user details by address', () => {
    it('should return false for invalid or non-existent addresses', async () => {
      const result = await resolvers.farcaster('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');
      expect(result).toBe(false);
    });

    it('should return false if user details cannot be fetched', async () => {
      const result = await resolvers.farcaster('0xeF8305E140ac520225DAf050e2f71d5fBcC543e7');
      expect(result).toBe(false);
    });

    it('should return an image URL if user details are successfully fetched and the user has a profile picture', async () => {
      const result = await resolvers.farcaster('0xd1a8Dd23e356B9fAE27dF5DeF9ea025A602EC81e');
      expect(result).toEqual(expect.stringContaining('http://'));
    });
  });
});
