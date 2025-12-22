import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationServicePort } from '../services/abstraction/service.notification.abstraction';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AppoinmentConfirmedDTO } from '../dtos/appoinment.confirm.dto';

@Controller()
export class AppoinmentConfirmedConsumer {
  private readonly logger = new Logger(AppoinmentConfirmedConsumer.name);
  constructor(private readonly appoinmentService: NotificationServicePort) {}

  @EventPattern('appoinment.confirmed')
  @UsePipes(
    new ValidationPipe({
      whitelist: true, //remove extra fields
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async handleAppoinmentConfirmed(
    @Payload() payload: AppoinmentConfirmedDTO,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      this.logger.log(
        `Recieved message from Appoinment Id -->${payload.appoinmentId}`,
      );
      await this.appoinmentService.create(payload);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      channel.ack(message);

      this.logger.log('Notification stored in NOTIFICATION DB');
    } catch (error) {
      this.logger.log('Error happened in Consumer', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      channel.nack(message, false, false);
    }
  }
}
