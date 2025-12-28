import { Injectable } from '@nestjs/common';
import { AppoinmentConfirmedDTO } from '../dtos/appoinment.confirm.dto';
import { refundPaymentDTO } from '../dtos/refund.payment.dto';
import { NotificationRepositoryPort } from '../repositories/abstraction/notification.repository.abstraction';
import { NotificationType } from '../utils/type.utils';
import { WebSocketGatewayPort } from '../gateways/abstraction/notification.abstraction.gateway';
import { NotificationServicePort } from './abstraction/service.notification.abstraction';
import { AbnormalityDTO } from '../dtos/abnormal.trigger.dto';

@Injectable()
export class NotificationService implements NotificationServicePort {
  constructor(
    private readonly notificationRepo: NotificationRepositoryPort,
    private readonly webSocketGateway: WebSocketGatewayPort,
  ) {}

  async appointmentSuccess(data: AppoinmentConfirmedDTO) {
    const userMsg = `Your appoinment is confirmed on ${data.appoinmentTime} at ${data.appoinmentDate}`;

    const userNoti = await this.notificationRepo.createNotification({
      receiverId: data.userId,
      role: 'USER',
      title: 'Appointment scheduled',
      message: userMsg,
      type: NotificationType.APPOINTMENT,
      payload: {
        userId: data.userId,
        doctorId: data.doctorId,
        appointmentDate: data.appoinmentDate,
        appointmentTime: data.appoinmentTime,
        appointmentId: data.appoinmentId,
      },
      isRead: false,
    });

    if (userNoti) {
      this.webSocketGateway.SendToUser(data.userId, {
        message: userNoti.message,
        type: NotificationType.APPOINTMENT,
        title: 'Appointment',
        isRead: false,
      });
    }

    const doctorMsg = `Hi Doctor, an appointment has been booked on ${data.appoinmentDate} Time ${data.appoinmentTime}`;
    const doctorNoti = await this.notificationRepo.createNotification({
      receiverId: data.doctorId,
      role: 'DOCTOR',
      title: 'Appointment scheduled',
      message: doctorMsg,
      type: NotificationType.APPOINTMENT,
      payload: {
        userId: data.userId,
        doctorId: data.doctorId,
        appointmentDate: data.appoinmentDate,
        appointmentTime: data.appoinmentTime,
        appointmentId: data.appoinmentId,
      },
      isRead: false,
    });

    if (doctorNoti) {
      this.webSocketGateway.SendToDoctor(data.doctorId, {
        message: doctorMsg,
        type: NotificationType.INFO,
        title: 'appointment',
        isRead: false,
      });
    }
  }

  async paymentRefund(data: refundPaymentDTO) {
    const msg = `Your appoinment is cancelled Date: ${data.appoinmentDate}, Time: ${data.appoinmentTime} , the payment for the appointment has been refunded. `;

    await this.notificationRepo.createNotification({
      receiverId: data.userId,
      role: 'USER',
      title: 'Appointment Cancelled',
      message: msg,
      type: NotificationType.APPOINTMENT,
      payload: {
        userId: data.userId,
        doctorId: data.doctorId,
        appointmentDate: data.appoinmentDate,
        appointmentTime: data.appoinmentTime,
        appointmentId: data.appoinmentId,
      },
      isRead: false,
    });

    this.webSocketGateway.SendToUser(data.userId, {
      message: msg,
      type: NotificationType.INFO,
      title: 'Appointment Cancelled',
      isRead: false,
    });
  }

  async abnormalityTriggering(data: AbnormalityDTO): Promise<void> {
    const symptomsList = data.abnormalSymptoms
      .map((sym) => `• ${sym}`)
      .join('\n'); // readable format

    const doctorMsg = `
⚠ *Abnormal Symptoms Detected*

**Patient:** ${data.fullName} (Age: ${data.age})
**Week:** ${data.week} | **Trimester:** ${data.trimester}
**First Pregnancy:** ${data.isFirstPregnancy === 'true' ? 'Yes' : 'No'}

**Symptoms Reported:**
${symptomsList}

Please review and take necessary action.
`.trim();

    const doctorNoti = await this.notificationRepo.createNotification({
      receiverId: data.doctorId,
      role: 'DOCTOR',
      type: NotificationType.ALERT,
      title: '👩🏼‍🦰🚨 Abnormal Pregnancy Warning 🚨',
      message: doctorMsg,
      payload: {
        patientId: data.userId,
        doctorId: data.doctorId,
        patientName: data.fullName,
        abnormalSymptoms: data.abnormalSymptoms,
        week: data.week,
        trimester: data.trimester,
        isFirstPregnancy: data.isFirstPregnancy,
        createdAt: new Date(),
      },
      isRead: false,
    });

    if (doctorNoti) {
      this.webSocketGateway.SendToDoctor(data.doctorId, {
        title: '👩🏼‍🦰🚨 Abnormal Pregnancy Warning 🚨',
        message: `${data.fullName} reported critical symptoms | Age: ${data.age} | Week:${data.week} | ${symptomsList} `,
        type: NotificationType.ALERT,
        isRead: doctorNoti.isRead,
        data: {
          patientId: data.userId,
          week: data.week,
          symptoms: data.abnormalSymptoms,
        },
      });
    }
  }
}
