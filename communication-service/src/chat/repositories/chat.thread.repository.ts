import { Injectable } from '@nestjs/common';
import { IThreadRepository } from './interfaces/thread.interface';
import { IChatThread } from '../utils/interfaces.utils';
import { ChatThread } from '../models/chat.thread.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ThreadRepository implements IThreadRepository {
  constructor(
    @InjectModel(ChatThread.name) private threadModel: Model<ChatThread>,
  ) {}

  async createThread(data: IChatThread): Promise<IChatThread> {
    return await this.threadModel.create(data);
  }

  async findThread(
    userId: string,
    doctorId: string,
  ): Promise<IChatThread | null> {
    return await this.threadModel.findOne({
      userId: userId,
      doctorId: doctorId,
      status: 'active',
    });
  }

  async updateLastMessage(threadId: string): Promise<IChatThread | null> {
    return await this.threadModel.findOneAndUpdate(
      { _id: threadId },
      { lastMessageAt: new Date() },
    );
  }

  async findThreadForUser(userId: string): Promise<IChatThread[] | null> {
    return await this.threadModel.find({ userId }).sort({ lastMessageAt: -1 });
  }
}
