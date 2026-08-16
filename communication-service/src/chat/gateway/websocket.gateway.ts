/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { TMessageDTO } from 'src/dtos/message.dto';
import type { IWebSocketGateway } from './interface/gateway.interface';
import { TYPES } from '../types';
import type { IChatService } from '../services/interfaces/chat.service.interface';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, IWebSocketGateway
{
  constructor(
    @Inject(TYPES.ChatService) private readonly chatService: IChatService,
  ) {}
  private readonly logger = new Logger(ChatGateway.name);
  private onlineUsers = new Map<string, Set<string>>();

  @WebSocketServer()
  private server!: Server;

  handleConnection(client: Socket) {
    console.log('user Connected-->', client.id);
    client.emit('user_connect', true);
  }

  handleDisconnect(client: Socket) {
    console.log('user disconeected', client.id);
    client.emit('user_disconnect', true);
  }

  @SubscribeMessage('join_private_room')
  handlePrivateRoom(
    @MessageBody() { threadId }: { threadId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Going to connect threadId');
    client.join(threadId);
    client.emit('joined_thread', threadId);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() payload: TMessageDTO,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('Sokcet---', payload);
      // 1 ) message saved using the service
      const savedMessage = await this.chatService.sendMessage(payload);

      // 2) create a Room
      client.join(savedMessage.message.threadId);

      //  3) Emit message to reciver & common private room
      this.server
        .to(savedMessage.message.threadId)
        .emit('receive_message', savedMessage.message);

      client.emit('message_sent_ack', savedMessage);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      client.emit('error_event', { error: error.message || 'Message failed' });
    }
  }
}
