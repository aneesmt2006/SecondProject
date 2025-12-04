import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import container from "./config/inversify.config.js";
import { redisClient } from "./config/redis.config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "./config/db.config.js";
import bodyParser from "body-parser";
import "./controllers/auth.controller.js";
import "./controllers/dr.auth.contrller.js"
import "./controllers/admin.auth.controller.js"
import cookieParser from 'cookie-parser'
import logger from "./utils/logger.js";

connectDB();
redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis...🔴🔴🔴");
  })
  .catch((err) => console.log(err));

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(bodyParser.urlencoded({limit:'50mb',extended:true}))
  app.use(bodyParser.json({limit:'50mb'}));
  app.use(cookieParser())
 
  app.use((req, _res, next) => {
    logger.info(`Body ${JSON.stringify(req.body)}`);
    next();
  });
  
});

server.setErrorConfig((app) => {
  app.use(errorHandler);
});

const app = server.build();

export default app;
