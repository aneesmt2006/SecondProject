import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationServicePort } from '../services/abstraction/service.notification.abstraction';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AppoinmentConfirmedDTO } from '../dtos/appoinment.confirm.dto';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);
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
      await this.appoinmentService.appointmentSuccess(payload);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      channel.ack(message);

      this.logger.log('Notification stored in NOTIFICATION DB');
    } catch (error) {
      this.logger.log('Error happened in Consumer', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      channel.nack(message, false, false);
    }
  }

  @EventPattern('payment.refunded')
  async handleRefundPayment(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log(
      'raw payload received in handleRefundPayment:',
      JSON.stringify(payload),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      this.logger.log('payload for refund', payload);
      await this.appoinmentService.paymentRefund(payload);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      channel.ack(message);

      this.logger.log('Refund notification processed and stored');
    } catch (error) {
      this.logger.error('Error handling refund payment notification', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      channel.nack(message, false, false);
    }
  }

  @EventPattern('tracking.abnormality')
  async handleAbnormalityMismatch(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log('the dat in evetn is', JSON.stringify(payload));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      this.logger.log('payload for tracking annormaltiy', payload);
      await this.appoinmentService.abnormalityTriggering(payload);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      channel.ack(message);
    } catch (error) {
      this.logger.log(
        'Error happened in tracking abnormality event notification service',
        error,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      channel.nack(channel, false, false);
    }
  }
}
