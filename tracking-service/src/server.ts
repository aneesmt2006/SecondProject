import app from "./app.js";
import { config } from "./config/env.config.js";

const PORT = config.port

app.listen(PORT, () => {
  console.log(` Tracking-service running on port ${PORT}`);
});
