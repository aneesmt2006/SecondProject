import { Inject, Injectable } from '@nestjs/common';
import { IChatService } from './interfaces/chat.service.interface';
import { TMessageDTO } from 'src/dtos/message.dto';
import { IChatMessage, IChatThread } from '../utils/interfaces.utils';
import { CHAT_MESSAGES } from '../constants/chat.messages.constant';
import { TYPES } from '../types';
import type { IThreadRepository } from '../repositories/interfaces/thread.interface';
import type { IMessageRepository } from '../repositories/interfaces/message.interface';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @Inject(TYPES.ThreadRepository)
    private readonly threadRepo: IThreadRepository,
    @Inject(TYPES.MessageRepository)
    private readonly messageRepo: IMessageRepository,
  ) {}

  /** Saves a chat message, creating a thread if one doesn't exist */
  async sendMessage(message: TMessageDTO): Promise<{ message: IChatMessage }> {
    let existThread = await this.threadRepo.findThread(
      message.userId,
      message.doctorId,
    );
    if (!existThread) {
      existThread = await this.threadRepo.createThread({
        userId: message.userId,
        doctorId: message.doctorId,
        startedAt: new Date(),
        lastMessageAt: new Date(),
        status: 'active',
      });
    } else {
      await this.threadRepo.updateLastMessage(existThread._id!.toString());
    }

    const newMessage = await this.messageRepo.createMessage({
      ...message,
      threadId: existThread._id!.toString(),
    });
    return { message: newMessage };
  }

  /** Fetches messages for a user–doctor thread */
  async getThreadMessages(
    userId: string,
    doctorId: string,
  ): Promise<{ messages: IChatMessage[]; message: string }> {
    const thread = await this.threadRepo.findThread(userId, doctorId);
    
    if (!thread) {
      return { messages: [], message: CHAT_MESSAGES.NO_MESSAGES };
    }

    const fetchMessages = await this.messageRepo.getMessages(
      thread._id as string,
      10,
    );

    if (!fetchMessages || fetchMessages.length === 0) {
      return { messages: [], message: CHAT_MESSAGES.NO_MESSAGES };
    }
    return {
      messages: fetchMessages,
      message: CHAT_MESSAGES.FETCHED_SUCCESS,
    };
  }

  /** Fetches all threads for a given user */
  async getUserThreads(
    userId: string,
  ): Promise<{ threads: IChatThread[]; message: string }> {
    const userThreads = await this.threadRepo.findThreadForUser(userId);
    if (!userThreads) return { threads: [], message: CHAT_MESSAGES.NO_THREADS };
    return { threads: userThreads, message: CHAT_MESSAGES.FETCHED_SUCCESS };
  }
}
