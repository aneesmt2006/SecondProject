import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { GatewayController } from "./controllers/GatewayController.js";
import { handleError } from "./middlewares/errorHandler.js";
import cors from "cors";
import logger from "./config/logger.js";
import routes from "./routes/index.js";

import helmet from "helmet";
import { limiter } from "./middlewares/rateLimiter.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(limiter);

const gatewayController = new GatewayController();

//logger midlleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} - ${req.url}`);
  console.log(req.method , req.url)
  next();
});

app.use(express.json());
app.use("/api/v1",routes);

//non proxied route - for health check
app.use("/health", (req, res) => gatewayController.healthCheck(req, res));

app.use((req: Request, res: Response) => {
  logger.warn("Resource not Found");
  res.status(404).json({ message: "Resource Not found" });
});

// err handler middlware
app.use(handleError);

export default app;
