import app from "./app.js";
import { config } from "./config/env.config.js";

const PORT = config.port || 3003;

app.listen(PORT, () => {
  console.log(`User Medical Service running on port ${PORT}`);
});
