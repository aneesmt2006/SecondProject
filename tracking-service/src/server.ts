import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.config.js";

const PORT = config.port

const startServer = async () => {
    await connectDB();
    await connectRabbitMQ();
    app.listen(PORT, () => {
        console.log(` Tracking-service running on port ${PORT}`);
    });
};

startServer();
