import { Types } from 'mongoose';

export interface IChatThread {
  _id?: string | Types.ObjectId;
  userId: string;
  doctorId: string;
  status: string;
  startedAt: Date;
  lastMessageAt: Date;
}

export interface IChatMessage {
  _id?: string | Types.ObjectId;
  threadId: string;
  senderType: 'user' | 'doctor' | 'admin';
  senderId: string;
  messageText: string;
  attachmentUrl: string;
  readStatus: boolean;
}
