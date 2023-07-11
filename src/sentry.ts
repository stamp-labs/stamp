import * as Sentry from '@sentry/node';
import { Express } from 'express';

export function initLogger(app: Express) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],

    tracesSampleRate: parseFloat(process.env.SENTRY_TRACE_SAMPLE_RATE as string),
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

export function fallbackLogger(app: Express) {
  app.use(Sentry.Handlers.errorHandler());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(function onError(err: any, req: any, res: any, _: any) {
    res.statusCode = 500;
    res.end(`${res.sentry}\n`);
  });
}

export function capture(e: any) {
  Sentry.captureException(e);
}
