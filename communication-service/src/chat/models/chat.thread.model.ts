import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'startedAt', updatedAt: false } })
export class ChatThread {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) doctorId: string;
  @Prop({ default: new Date() }) startedAt: Date;
  @Prop({ default: new Date() }) lastMessageAt: Date;
  @Prop({ default: 'active' }) status: string;
}

export const ChatThreadSchema = SchemaFactory.createForClass(ChatThread);
