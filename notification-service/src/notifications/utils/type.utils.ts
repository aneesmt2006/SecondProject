export interface ICreateNotificationModel {
  receiverId: string;
  role?: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, any>;
  isRead: boolean;
}

export enum NotificationType {
  APPOINTMENT = 'APPOINTMENT',
  ALERT = 'ALERT',
  INFO = 'PAYMENT',
  GENERAL = 'GENERAL',
}

export interface WebSocketPayload {
  message: string;
  type: NotificationType;
  title: string;
  isRead: boolean;
  data?: Record<string, any>;
}
