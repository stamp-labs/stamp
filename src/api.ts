import express from 'express';
import { capture } from '@snapshot-labs/snapshot-sentry';
import { parseQuery, resize, setHeader } from './utils';
import { streamToBuffer } from './aws';
import Cache from './resolvers/cache';
import resolvers from './resolvers';
import constants from './constants.json';
import { rpcError, rpcSuccess } from './helpers/utils';
import { lookupAddresses, resolveNames } from './addressResolvers';

const router = express.Router();
const TYPE_CONSTRAINTS = Object.keys(constants.resolvers).join('|');

router.post('/', async (req, res) => {
  const { id = null, method, params } = req.body;
  if (!method) return rpcError(res, 400, 'missing method', id);
  try {
    let result: any = {};
    if (!Array.isArray(params)) return rpcError(res, 400, 'params must be an array of string', id);

    if (method === 'lookup_addresses') result = await lookupAddresses(params);
    else if (method === 'resolve_names') result = await resolveNames(params);
    else return rpcError(res, 400, 'invalid method', id);

    if (result?.error) return rpcError(res, result.code || 500, result.error, id);
    return rpcSuccess(res, result, id);
  } catch (e) {
    const err = e as any;
    capture(err.error ? new Error(err.error) : err);
    return rpcError(res, 500, e, id);
  }
});

router.get(`/clear/:type(${TYPE_CONSTRAINTS})/:id`, async (req, res) => {
  const { type, id } = req.params;
  try {
    const cache = new Cache(
      await parseQuery(id, type, {
        s: constants.max,
        fb: req.query.fb,
        cb: req.query.cb
      })
    );
    const result = await cache.clear();
    res.status(result ? 200 : 404).json({ status: result ? 'ok' : 'not found' });
  } catch (e) {
    capture(e);
    res.status(500).json({ status: 'error', error: 'failed to clear cache' });
  }
});

router.get(`/:type(${TYPE_CONSTRAINTS})/:id`, async (req, res) => {
  const { type, id } = req.params;
  let parsedParams, address, network, w, h, fallback;

  try {
    parsedParams = await parseQuery(id, type, req.query);
    ({ address, network, w, h, fallback } = parsedParams);
  } catch (e) {
    return res.status(500).json({ status: 'error', error: 'failed to load content' });
  }

  const cache = new Cache(parsedParams);

  // Check resized cache
  const cachedResizedImage = await cache.getResizedImage();
  if (cachedResizedImage) {
    setHeader(res);
    return cachedResizedImage.pipe(res);
  }

  // Check base cache
  const cachedBaseImage = await cache.getBasedImage();
  let baseImage: Buffer;

  if (cachedBaseImage) {
    baseImage = await streamToBuffer(cachedBaseImage);
  } else {
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
  if (!cachedBaseImage) {
    await cache.setBaseImage(baseImage);
  }
  await cache.setResizedImage(resizedImage);
});

export default router;
