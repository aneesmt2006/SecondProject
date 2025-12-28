import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  receiverId: string; // user or doctor

  @Prop({ required: true, enum: ['USER', 'DOCTOR'] })
  role: 'USER' | 'DOCTOR';

  @Prop({
    required: true,
    enum: ['APPOINTMENT', 'ALERT', 'PAYMENT', 'GENERAL'],
  })
  type: 'APPOINTMENT' | 'ALERT' | 'PAYMENT' | 'GENERAL';

  @Prop()
  title: string;

  @Prop()
  message: string;

  @Prop({ type: Object }) // to store appointmentId, symptoms, week etc
  payload: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
