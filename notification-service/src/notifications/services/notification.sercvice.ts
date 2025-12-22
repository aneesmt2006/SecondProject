import { Injectable } from '@nestjs/common';
import { AppoinmentConfirmedDTO } from '../dtos/appoinment.confirm.dto';
import { NotificationRepositoryPort } from '../repositories/abstraction/notification.repository.abstraction';
import { NotificationType } from 'src/notifications/utils/type.utils';
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
  }
}
