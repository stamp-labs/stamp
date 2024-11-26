import resolvers from '../../../src/resolvers';

describe('resolvers', () => {
  describe('snapshot', () => {
    describe('on user avatar', () => {
      it('should return false if missing', async () => {
        const result = await resolvers.snapshot('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');

        expect(result).toBe(false);
      });

      it('should resolve regardless of network', async () => {
        const result = await resolvers.snapshot(
          '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7',
          1,
          'eth'
        );

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(1000);
      });

      it('should resolve', async () => {
        const result = await resolvers.snapshot('0xeF8305E140ac520225DAf050e2f71d5fBcC543e7');

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(1000);
      });
    });
  });

  describe('on user cover', () => {
    it('should return false if missing', async () => {
      const result = await resolvers['user-cover']('0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70');

      expect(result).toBe(false);
    });

    it('should resolve regardless of network', async () => {
      const result = await resolvers.snapshot(
        '0xf1f09AdC06aAB740AA16004D62Dbd89484d3Be90',
        1,
        'eth'
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });

    it('should resolve', async () => {
      const result = await resolvers['user-cover']('0xf1f09AdC06aAB740AA16004D62Dbd89484d3Be90');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });
  });

  describe('on space avatar', () => {
    it('should return false if missing', async () => {
      const result = await resolvers.space('idonthaveensdomain.eth');

      expect(result).toBe(false);
    });

    it('should return false on unsupported network', async () => {
      const result = await resolvers.space('ens.eth', 1, 'eth');

      expect(result).toBe(false);
    });

    it('should resolve', async () => {
      const result = await resolvers.space('ens.eth');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });

    it('should return same result for both legacy and non-legacy format', async () => {
      const resultA = await resolvers.space('ens.eth');
      const resultB = await resolvers.space('ens.eth', 1, 's');

      expect(resultA).toBeInstanceOf(Buffer);
      expect(resultA.length).toBeGreaterThan(1000);
      expect(resultA).toEqual(resultB);
    });
  });

  describe('on space cover', () => {
    it('should return false if missing', async () => {
      const result = await resolvers['space-cover']('idonthaveensdomain.eth');

      expect(result).toBe(false);
    });

    it('should return false on unsupported network', async () => {
      const result = await resolvers['space-cover']('test.wa0x6e.eth', 1, 'eth');

      expect(result).toBe(false);
    });

    it('should resolve', async () => {
      const result = await resolvers['space-cover']('test.wa0x6e.eth');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    });

    it('should return same result for both legacy and non-legacy format', async () => {
      const resultA = await resolvers['space-cover']('test.wa0x6e.eth');
      const resultB = await resolvers['space-cover']('test.wa0x6e.eth', 1, 's');

      expect(resultA).toBeInstanceOf(Buffer);
      expect(resultA.length).toBeGreaterThan(1000);
      expect(resultA).toEqual(resultB);
    });
  });
});
