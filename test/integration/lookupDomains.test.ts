import lookupDomains from '../../src/lookupDomains';

describe('lookupDomains', () => {
  it('should return an array of addresses', async () => {
    const result = await lookupDomains('0x24F15402C6Bb870554489b2fd2049A85d75B982f');

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toContain('.eth');
  });

  it('should return an empty array if the address is not provided', async () => {
    const result = await lookupDomains('');

    expect(result).toEqual([]);
  });

  it('should return an empty array if the address does not own any domains', async () => {
    const result = await lookupDomains('0xf1f09AdC06aAB740AA16004D62Dbd89484d3Be90');

    expect(result).toEqual([]);
  });

  it('should return invalid domains', async () => {
    const result = await lookupDomains('0xa2e81c205e38324bf7432aecbd2c7e20c717e1d3');

    expect(result).toEqual([
      '[090fdc7e2b2c9f51e9f228395059bf4d88379c2cea8082bec00613ed967407cc].xyz'
    ]);
  });

  it('should filter out expired domains', async () => {
    const result = await lookupDomains('0x76ece6825602294b87a40d783982d83bb8ebcaf7');

    expect(result).not.toContain(['everaidao.eth', 'everark.eth', 'everaiark.eth']);
  });
});
