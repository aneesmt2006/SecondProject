import { MongooseModule } from '@nestjs/mongoose';
import { ChatThread, ChatThreadSchema } from './models/chat.thread.model';
import { ChatMessage, chatMessageSchema } from './models/chat.message.model';
import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/websocket.gateway';
import { ChatService } from './services/chat.service';
import { ThreadRepository } from './repositories/chat.thread.repository';
import { MessageRepository } from './repositories/chat.message.repository';
import { TYPES } from './types';
import { ChatController } from './controllers/chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatThread.name, schema: ChatThreadSchema },
      { name: ChatMessage.name, schema: chatMessageSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    {
      provide: TYPES.ChatService,
      useClass: ChatService,
    },
    {
      provide: TYPES.MessageRepository,
      useClass: MessageRepository,
    },
    {
      provide: TYPES.ThreadRepository,
      useClass: ThreadRepository,
    },
  ],
})
export class ChatModule {}
