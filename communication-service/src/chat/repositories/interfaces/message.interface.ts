import { IChatMessage } from 'src/chat/utils/interfaces.utils';

export interface IMessageRepository {
  createMessage(message: IChatMessage): Promise<IChatMessage>;
  getMessages(threadId: string, limit?: number): Promise<IChatMessage[] | null>;
}
