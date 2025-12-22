export type CreateNotificationModel = {
  userId: string;
  doctorId?: string;
  appoinmentId: string;
  type: NotificationType;
  message: string;
};

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  INFO = 'INFO',
}

export interface WebSocketPayload {
  message: string;
  type: NotificationType;
  title: string;
  isRead: boolean;
}
