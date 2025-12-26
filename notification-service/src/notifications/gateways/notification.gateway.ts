import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketGatewayPort } from './abstraction/notification.abstraction.gateway';
import { WebSocketPayload } from '../utils/type.utils';

@WebSocketGateway({ cors: { origin: '* ' } })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, WebSocketGatewayPort
{
  private readonly logger = new Logger(NotificationGateway.name);
  @WebSocketServer()
  private server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      this.logger.log(`Socket ${userId}  is connected but without userId`);
      return;
    }

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId)?.add(client.id);
    this.logger.log(`User connected ${userId} with socket Id ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    client.disconnect();
    for (const [userId, sockets] of this.userSockets) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSockets.delete(userId);
        break;
      }
    }
    this.logger.log(`Client disconnected ${client.id}`);
  }

  SendToUser(userId: string, payload: WebSocketPayload): void {
    this.logger.log('message handling gateway');
    const socketsIds = this.userSockets.get(userId);

    if (!socketsIds || socketsIds.size === 0) {
      this.logger.warn(`User ${userId} is offline`);
      return;
    }

    for (const id of socketsIds) {
      this.server.to(id).emit(`user:${userId}`, payload);
    }
  }

  SendToDoctor(userId: string, payload: WebSocketPayload) {
    this.logger.log('message handling gateway');
    const socketsIds = this.userSockets.get(userId);

    if (!socketsIds || socketsIds.size === 0) {
      this.logger.warn(`User ${userId} is offline`);
      return;
    }

    for (const id of socketsIds) {
      this.server.to(id).emit(`doctor:${userId}`, payload);
    }
  }
}
