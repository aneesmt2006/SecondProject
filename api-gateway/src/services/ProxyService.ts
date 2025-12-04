
import { createProxyMiddleware, type Options } from "http-proxy-middleware";
import type { IProxyConfig } from "../utils/interface.js";
import type { Request, Response } from "express";
import logger from "../config/logger.js";

export class ServiceProxy {
  createProxy(config: IProxyConfig) {
    logger.info(`Configuring Proxy for ${config.serviceName} at ${config.target}`);
    const proxyOptions: Options = {
      target: config.target,
      changeOrigin: true,
      pathRewrite: config.pathRewrite || {},
      on: {     
        proxyReq: (proxyReq:any, req:any)=> {
          console.log('🔍 Forwarded path (after rewrite):', proxyReq.path);  // This logs the actual forwarded path
        }
      },
      onError: (err: Error, req: Request, res: Response) => {
        logger.error(`Service unavailable for ${config.serviceName} : ${err.message}`);
        if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
          res.status(503).json({ message: `${config.serviceName} currently unavailable, please try again later` });
        } else {
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
    } as any;
    return createProxyMiddleware(proxyOptions);
  }
}

