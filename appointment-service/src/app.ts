import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./config/db.config.js";
import bodyParser from "body-parser";
import { container } from "./config/inversify.config.js";
import { metricsHandler } from "./utils/metrics.js";
import logger from "./utils/logger.js";
import { randomUUID } from "crypto";
import helmet from "helmet";

// Note: MongoDB is connected at top-level in db.config.ts.

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
    app.use(helmet());

    // 1MB limit for security
    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));

    // Extract x-request-id from gateway and propagate it
    app.use((req, res, next) => {
        const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
        req.headers['x-request-id'] = requestId;
        res.setHeader('X-Request-ID', requestId);
        next();
    });

    // Structured logging for every request
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.url}`, {
            requestId: req.headers['x-request-id'],
            ip: req.ip,
        });
        next();
    });

    app.get('/metrics', metricsHandler);
});

server.setErrorConfig((app) => {
    app.use(errorHandler);
});

const app = server.build();

export default app;