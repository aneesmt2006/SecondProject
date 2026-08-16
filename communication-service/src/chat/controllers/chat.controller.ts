import { Controller, Get, Headers, Inject, Param } from '@nestjs/common';
import { TYPES } from '../types';
import type { IChatService } from '../services/interfaces/chat.service.interface';

@Controller('chat')
export class ChatController {
  constructor(
    @Inject(TYPES.ChatService) private readonly chatService: IChatService,
  ) {}

  @Get('messages/:id')
  async getMessages(
    @Param('id') id: string,
    @Headers('x-token-role') role: string,
    @Headers('x-token-id') myId: string,
  ) {
    const userId = role === 'user' ? myId : id;
    const doctorId = role === 'doctor' ? myId : id;

    const result = await this.chatService.getThreadMessages(userId, doctorId);

    return result;
  }
}
