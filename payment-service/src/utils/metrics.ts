import client from 'prom-client';
import type { Request, Response } from 'express';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const metricsHandler = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
};
