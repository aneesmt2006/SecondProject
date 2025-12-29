import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";

const PORT = config.port || 3003;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`User Medical Service running on port ${PORT}`);
    });
};

startServer();
