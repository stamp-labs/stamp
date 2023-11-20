import express from 'express';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { parseQuery, resize, setHeader, getCacheKey } from './utils';
import { set, get, streamToBuffer, clear } from './aws';
import resolvers from './resolvers';
import constants from './constants.json';
import { rpcError, rpcSuccess } from './helpers/utils';
import { lookupAddresses, resolveName } from './addressResolvers';

const router = express.Router();
const TYPE_CONSTRAINTS = Object.keys(constants.resolvers).join('|');

router.post('/', async (req, res) => {
  const { id = null, method, params } = req.body;
  if (!method) return rpcError(res, 400, 'missing method', id);
  try {
    let result: any = {};
    if (method === 'lookup_addresses') result = await lookupAddresses(params);
    else if (method === 'resolve_name') result = await resolveName(params);
    else return rpcError(res, 400, 'invalid method', id);

    if (result.error) return rpcError(res, result.code || 500, result.error, id);
    return rpcSuccess(res, result, id);
  } catch (e) {
    capture(e);
    return rpcError(res, 500, e, id);
  }
});

router.get(`/clear/:type(${TYPE_CONSTRAINTS})/:id`, async (req, res) => {
  const { type, id } = req.params;
  try {
    const { address, network, w, h, fallback } = await parseQuery(id, type, {
      s: constants.max,
      fb: req.query.fb,
      cb: req.query.cb
    });
    const key = getCacheKey({ type, network, address, w, h, fallback });
    await clear(key);
    res.status(200).json({ status: 'ok' });
  } catch (e) {
    capture(e);
    res.status(500).json({ status: 'error', error: 'failed to clear cache' });
  }
});

router.get(`/:type(${TYPE_CONSTRAINTS})/:id`, async (req, res) => {
  const { type, id } = req.params;
  let address, network, w, h, fallback, cb;

  try {
    ({ address, network, w, h, fallback, cb } = await parseQuery(id, type, req.query));
  } catch (e) {
    return res.status(500).json({ status: 'error', error: 'failed to load content' });
  }

  const key1 = getCacheKey({
    type,
    network,
    address,
    w: constants.max,
    h: constants.max,
    fallback,
    cb
  });
  const key2 = getCacheKey({ type, network, address, w, h, fallback, cb });

  // Check resized cache
  const cache = await get(`${key1}/${key2}`);
  if (cache) {
    // console.log('Got cache', address);
    setHeader(res);
    return cache.pipe(res);
  }

  // Check base cache
  const base = await get(`${key1}/${key1}`);
  let baseImage;
  if (base) {
    baseImage = await streamToBuffer(base);
    // console.log('Got base cache');
  } else {
    // console.log('No cache for', key1, base);

    let currentResolvers: string[] = constants.resolvers.avatar;
    if (type === 'token') currentResolvers = constants.resolvers.token;
    if (type === 'space') currentResolvers = constants.resolvers.space;
    if (type === 'space-sx') currentResolvers = constants.resolvers['space-sx'];
    if (type === 'space-cover-sx') currentResolvers = constants.resolvers['space-cover-sx'];

    const files = await Promise.all(currentResolvers.map(r => resolvers[r](address, network)));
    baseImage = [...files].reverse().find(file => !!file);

    if (!baseImage) {
      const fallbackImage = await resolvers[fallback](address, network);
      const resizedImage = await resize(fallbackImage, w, h);

      setHeader(res, 'SHORT_CACHE');
      return res.send(resizedImage);
    }
  }

  // Resize and return image
  const resizedImage = await resize(baseImage, w, h);
  setHeader(res);
  res.send(resizedImage);

  // Store cache
  try {
    if (!base) {
      await set(`${key1}/${key1}`, baseImage);
      console.log('Stored base cache', key1);
    }
    await set(`${key1}/${key2}`, resizedImage);
    console.log('Stored cache', address);
  } catch (e) {
    capture(e);
    console.log('Store cache failed', address, e);
  }
});

export default router;
