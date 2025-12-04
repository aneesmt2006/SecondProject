import "reflect-metadata"
import { InversifyExpressServer } from "inversify-express-utils"
import { errorHandler } from "./middlewares/errorHandler.js"
import { connectDB } from "./config/db.config.js"
import bodyParser from "body-parser"
import { container } from "./config/inversify.config.js"
import morgan from "morgan"
import cors from "cors"
import { config } from "./config/env.config.js"
import { metricsHandler } from "./utils/metrics.js";
import logger from "./utils/logger.js";

connectDB();

const server = new InversifyExpressServer(container)

server.setConfig((app) => {
    // app.use(cors({
    //     origin: config.clientUrl,
    //     credentials: true
    // }));
    app.use(bodyParser.json({limit:'50mb'}));
    app.use(bodyParser.urlencoded({ extended: true ,limit:'50mb' }));
    app.use(morgan("dev"));
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.url}`);
        next();
    });
    app.get('/metrics', metricsHandler);
});

server.setErrorConfig((app) => {
    app.use(errorHandler);
});

const app = server.build();

export default app;