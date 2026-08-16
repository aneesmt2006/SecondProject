import type { Request, Response } from 'express';
import { config } from '../config/env.js';

export class GatewayController {
  healthCheck(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'ok',
      service: config.service,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: config.deploy,
    });
  }
}