import blockie from './blockie';
import jazzicon from './jazzicon';
import ens from './ens';
import trustwallet from './trustwallet';
import snapshot from './snapshot';
import space from './space';
import { resolveAvatar as sxResolveAvatar, resolveCover as sxResolveCover } from './space-sx';
import selfid from './selfid';
import lens from './lens';
import zapper from './zapper';
import constants from '../constants.json';

const RESOLVERS = {
  blockie,
  jazzicon,
  ens,
  trustwallet,
  snapshot,
  space,
  'space-sx': sxResolveAvatar,
  'space-cover-sx': sxResolveCover,
  selfid,
  lens,
  zapper
} as const;

export function resolve(
  type: string,
  address: string,
  network: string,
  resolvers?: string[]
): Promise<any> {
  let _resolvers: string[] = resolvers ?? [];

  _resolvers = constants.resolvers[type] || constants.resolvers.avatar;

  return Promise.all(_resolvers.map(r => RESOLVERS[r](address, network)));
}

export default RESOLVERS;
