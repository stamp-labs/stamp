import { lookupAddresses, resolveNames } from '../../../src/addressResolvers/lens';
import testAddressResolver from './utils';

testAddressResolver(
  'Lens',
  lookupAddresses,
  resolveNames,
  '0xeF8305E140ac520225DAf050e2f71d5fBcC543e7',
  'fabien.lens',
  '0x0C67A201b93cf58D4a5e8D4E970093f0FB4bb0D1',
  ['domain.crypto', 'domain.eth', 'domain.com']
);
