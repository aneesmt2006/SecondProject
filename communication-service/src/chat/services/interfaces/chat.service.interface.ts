import { IChatMessage, IChatThread } from 'src/chat/utils/interfaces.utils';
import { TMessageDTO } from 'src/dtos/message.dto';

export interface IChatService {
  sendMessage(message: TMessageDTO): Promise<{ message: IChatMessage }>;
  getThreadMessages(
    userId: string,
    doctorId: string,
  ): Promise<{ messages: IChatMessage[]; message: string }>;
  getUserThreads(
    userId: string,
  ): Promise<{ threads: IChatThread[]; message: string }>;
}
