import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: { createdAt: 'startedAt', updatedAt: false } })
export class ChatThread {
  @Prop({ required: true })
  userId!: string;
  @Prop({ required: true })
  doctorId!: string;
  @Prop({ default: Date.now })
  startedAt!: Date;
  @Prop({ default: Date.now })
  lastMessageAt!: Date;
  @Prop({ default: 'active' })
  status!: string;
}

export const ChatThreadSchema = SchemaFactory.createForClass(ChatThread);
