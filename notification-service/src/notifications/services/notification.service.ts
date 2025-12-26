import { Injectable } from '@nestjs/common';
import { AppoinmentConfirmedDTO } from '../dtos/appoinment.confirm.dto';
import { refundPaymentDTO } from '../dtos/refund.payment.dto';
import { NotificationRepositoryPort } from '../repositories/abstraction/notification.repository.abstraction';
import { NotificationType } from '../utils/type.utils';
import { WebSocketGatewayPort } from '../gateways/abstraction/notification.abstraction.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepositoryPort,
    private readonly webSocketGateway: WebSocketGatewayPort,
  ) {}

  async create(data: AppoinmentConfirmedDTO) {
    const msg = `Your appoinment is confirmed on ${data.appoinmentTime} at ${data.appoinmentDate}`;

    await this.notificationRepo.createNotification({
      userId: data.userId,
      doctorId: data.doctorId,
      appoinmentId: data.appoinmentId,
      type: NotificationType.SUCCESS,
      message: msg,
    });

    this.webSocketGateway.SendToUser(data.userId, {
      message: msg,
      type: NotificationType.SUCCESS,
      title: 'appointment',
      isRead: false,
    });

    this.webSocketGateway.SendToDoctor(data.doctorId, {
      message: `Hi Doctor, an appointment has been booked on ${data.appoinmentDate} Time ${data.appoinmentTime}`,
      type: NotificationType.INFO,
      title: 'appointment',
      isRead: false,
    });
  }

  async paymentRefund(data: refundPaymentDTO) {
    const msg = `Your appoinment is cancelled Date: ${data.appoinmentDate}, Time: ${data.appoinmentTime} , the payment for the appointment has been refunded. `;

    await this.notificationRepo.createNotification({
      userId: data.userId,
      doctorId: data.doctorId,
      appoinmentId: data.appoinmentId,
      type: NotificationType.INFO,
      message: msg,
    });

    this.webSocketGateway.SendToUser(data.userId, {
      message: msg,
      type: NotificationType.INFO,
      title: 'Payment Refund',
      isRead: false,
    });
  }
}
