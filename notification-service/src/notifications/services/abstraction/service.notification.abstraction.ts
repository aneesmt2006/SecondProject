import { AppoinmentConfirmedDTO } from 'src/notifications/dtos/appoinment.confirm.dto';

export abstract class NotificationServicePort {
  abstract create(data: AppoinmentConfirmedDTO): Promise<void>;
}
