import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { randomUUID } from 'crypto';
import { GatewayController } from './controllers/GatewayController.js';
import { handleError } from './middlewares/errorHandler.js';
import cors from 'cors';
import logger from './config/logger.js';
import routes from './routes/index.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { metricsHandler } from './utils/metrics.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import { config } from './config/env.js';



const app = express();

app.use(helmet());

const allowedOrigins = [config.frontEndUrl, config.frontEndUrl2].filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  credentials: true,
}));

// 1MB limit on all incoming request bodies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(cookieParser());

// Inject X-Request-ID for distributed tracing across services
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`, {
    requestId: req.headers['x-request-id'],
    ip: req.ip,
  });
  next();
});

// Global rate limiter — per-route tighter limits applied in authRoutes.ts
app.use(globalLimiter);

const gatewayController = new GatewayController();

app.get('/health', (req, res) => gatewayController.healthCheck(req, res));

// TODO: re-enable IP guard before production deployment
app.get('/metrics', metricsHandler);

app.use('/api/v1', routes);

app.use((req: Request, res: Response) => {
  logger.warn(`404 — Resource not found: ${req.method} ${req.originalUrl}`, {
    requestId: req.headers['x-request-id'],
  });
  res.status(404).json({ status: 'error', message: 'Resource not found' });
});

app.use(handleError);

export default app;
