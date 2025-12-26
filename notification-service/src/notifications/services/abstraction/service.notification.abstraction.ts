import { AppoinmentConfirmedDTO } from 'src/notifications/dtos/appoinment.confirm.dto';
import { refundPaymentDTO } from 'src/notifications/dtos/refund.payment.dto';

export abstract class NotificationServicePort {
  abstract create(data: AppoinmentConfirmedDTO): Promise<void>;
  abstract paymentRefund(data: refundPaymentDTO): Promise<void>;
}
