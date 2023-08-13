import init from '@snapshot-labs/snapshot-metrics';
import { Express } from 'express';
import constants from './constants.json';

const TYPE_CONSTRAINTS = Object.keys(constants.resolvers).join('|');

export default function initMetrics(app: Express) {
  init(app, {
    normalizedPath: [
      [`^/clear/(${TYPE_CONSTRAINTS})/.*`, '/clear/$1/#id'],
      [`^/(${TYPE_CONSTRAINTS})/.*`, '/$1/#id']
    ],
    whitelistedPath: [
      /^\/$/,
      new RegExp(`^/clear/(${TYPE_CONSTRAINTS})/.*$`),
      new RegExp(`^/(${TYPE_CONSTRAINTS})/.*$`)
    ]
  });
}
