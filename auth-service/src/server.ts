import "reflect-metadata"; // for inversify
import app from "./app.js";
import { config } from "./config/env.config.js";
import { metricsHandler } from "./utils/metrics.js";

app.use((req, res, next) => {
  console.log("-------------->", req.body);
  next();
}); 

app.get('/metrics', metricsHandler);
app.listen(config.port, () => {
  console.log("AUTH service is running at", config.port);
});
