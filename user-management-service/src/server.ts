import app from "./app.js";
import { config } from "./config/env.config.js";

const PORT = config.port || 3002;

app.listen(PORT, () => {
  console.log(`User Management Service running on port ${PORT}`);
});
