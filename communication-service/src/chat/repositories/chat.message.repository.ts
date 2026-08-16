import { Injectable } from '@nestjs/common';
import { IMessageRepository } from './interfaces/message.interface';
import { IChatMessage } from '../utils/interfaces.utils';
import { InjectModel } from '@nestjs/mongoose';
import { ChatMessage } from '../models/chat.message.model';
import { Model } from 'mongoose';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessage>,
  ) {}
  async createMessage(message: IChatMessage): Promise<IChatMessage> {
    return await this.messageModel.create(message);
  }

  async getMessages(
    threadId: string,
    limit: number,
  ): Promise<IChatMessage[] | null> {
    return await this.messageModel
      .find({ threadId })
      .sort({ sendAt: -1 })
      .limit(limit);
  }
}
