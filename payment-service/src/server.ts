import app from "./app.js";
import { config } from "./config/env.config.js";

const PORT = config.port

app.listen(PORT, () => {
  console.log(`  Payment SERVICE running on port ${PORT}`);
});
