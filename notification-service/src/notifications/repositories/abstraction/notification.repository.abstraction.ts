import { Notification } from 'src/notifications/models/notification.module';
import { ICreateNotificationModel } from 'src/notifications/utils/type.utils';

export abstract class NotificationRepositoryPort {
  abstract createNotification(
    data: ICreateNotificationModel,
  ): Promise<Notification>;
}
