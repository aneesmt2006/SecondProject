import { CreateNotificationModel } from 'src/notifications/utils/type.utils';

export abstract class NotificationRepositoryPort {
  abstract createNotification(data: CreateNotificationModel): Promise<void>;
}
