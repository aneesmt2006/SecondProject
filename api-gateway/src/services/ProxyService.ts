import { createProxyMiddleware, fixRequestBody, type Options } from 'http-proxy-middleware';
import type { IProxyConfig } from '../utils/interface.js';
import type { Request, Response } from 'express';
import logger from '../config/logger.js';
import type { ClientRequest, IncomingMessage } from 'http';

export class ServiceProxy {
  private buildOptions(config: IProxyConfig): Options {
    return {
      target: config.target,
      changeOrigin: true,
      pathRewrite: config.pathRewrite ?? {},
      proxyTimeout: 10_000,
      timeout: 10_000,
      on: {
        proxyReq: (proxyReq: ClientRequest, req: IncomingMessage, res: Response) => {
          const expressReq = req as Request;
          const requestId = expressReq.headers['x-request-id'];

          // Forward trace ID so downstream services can correlate logs
          if (requestId) proxyReq.setHeader('x-request-id', requestId);

          // Fix body parsing issue where express.json() consumes the stream before the proxy
          fixRequestBody(proxyReq, req);

          logger.debug(`Proxying ${expressReq.method} ${expressReq.originalUrl} → ${config.target}${proxyReq.path}`, {
            service: config.serviceName,
            requestId,
          });
        },
        error: this.buildErrorHandler(config),
      },
    } as unknown as Options;
  }

  private buildErrorHandler(config: IProxyConfig) {
    return (err: Error, req: Request, res: Response) => {
      logger.error(`Proxy error for ${config.serviceName}: ${err.message}`, {
        target: config.target,
        path: req.originalUrl,
        requestId: req.headers['x-request-id'],
      });

      if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
        res.status(503).json({
          status: 'error',
          message: `${config.serviceName} is temporarily unavailable. Please try again later.`,
        });
      } else {
        res.status(500).json({ status: 'error', message: 'Internal Server Error , okkk' });
      }
    };
  }

  createProxy(config: IProxyConfig) {
    logger.info(`Configuring proxy: ${config.serviceName} → ${config.target}`);
    return createProxyMiddleware(this.buildOptions(config));
  }
}
