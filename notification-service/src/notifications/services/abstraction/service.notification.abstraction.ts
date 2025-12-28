import { AbnormalityDTO } from 'src/notifications/dtos/abnormal.trigger.dto';
import { AppoinmentConfirmedDTO } from 'src/notifications/dtos/appoinment.confirm.dto';
import { refundPaymentDTO } from 'src/notifications/dtos/refund.payment.dto';

export abstract class NotificationServicePort {
  abstract appointmentSuccess(data: AppoinmentConfirmedDTO): Promise<void>;
  abstract paymentRefund(data: refundPaymentDTO): Promise<void>;
  abstract abnormalityTriggering(data: AbnormalityDTO): Promise<void>;
}
