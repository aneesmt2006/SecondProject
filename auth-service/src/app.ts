import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import container from "./config/inversify.config.js";
import { redisClient } from "./config/redis.config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import bodyParser from "body-parser";
import "./controllers/auth.controller.js";

redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis...🔴🔴🔴");
  })
  .catch((err) => console.log(err));
const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  // app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(bodyParser.json());

  app.use((req, _res, next) => {
    console.log("BOdy", req.body);
    next();
  });
});

server.setErrorConfig((app) => {
  app.use(errorHandler);
});

const app = server.build();

export default app;
