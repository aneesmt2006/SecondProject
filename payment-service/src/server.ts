import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.config.js";
import { consumeAppointmentEvents } from "./consumers/refund.consumer.js";

const PORT = config.port;

const start = async () => {
  try {
    await connectRabbitMQ();
    await consumeAppointmentEvents();

    app.listen(PORT, () => {
      console.log(`  Payment SERVICE running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
