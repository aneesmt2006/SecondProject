import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: { createdAt: 'sendAt' } })
export class ChatMessage {
  @Prop({ required: true })
  threadId!: string;
  @Prop({ required: true })
  senderId!: string;
  @Prop({ required: true })
  senderType!: 'user' | 'doctor' | 'admin';
  @Prop()
  messageText?: string;
  @Prop()
  attachmentUrl?: string;
  @Prop({ default: false })
  readStatus!: boolean;
}

export const chatMessageSchema = SchemaFactory.createForClass(ChatMessage);
