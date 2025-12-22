import app from "./app.js";
import { config } from "./config/env.config.js";

import { connectRabbitMQ } from "./config/rabbitmq.config.js";
import { startPaymentConsumer } from "./consumers/payment.consumer.js";

const PORT = config.port

const start = async () => {
  try {
    await connectRabbitMQ();
    await startPaymentConsumer();
    
    app.listen(PORT, () => {
      console.log(`APPOINTMENT SERVICE running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
}

start();
