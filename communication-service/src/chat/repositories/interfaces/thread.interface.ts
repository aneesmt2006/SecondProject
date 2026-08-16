import { IChatThread } from 'src/chat/utils/interfaces.utils';

export interface IThreadRepository {
  findThread(userId: string, doctorId: string): Promise<IChatThread | null>;
  createThread(data: IChatThread): Promise<IChatThread>;
  updateLastMessage(threadId: string): Promise<IChatThread | null>;
  findThreadForUser(userId: string): Promise<IChatThread[] | null>;
}
