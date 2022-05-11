import resolve, { resolve_provider_getName_getAvatar } from '../src/resolvers/ens';
import { benchmark } from '../src/utils';

const methods = [resolve, resolve_provider_getName_getAvatar];
const inputs = [
	['0x809fa673fe2ab515faa168259cb14e2bedebf68e'],
	['0x809fa673fe2ab515faa168259cb14e2bedebf68e']
];
const identifiers = ['ORIGINAL (likely with caching on metadata server)', 'getName from contract, then provider.getAvatar(name)'];

benchmark(methods, inputs, 4, identifiers);
