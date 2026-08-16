/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import type { JoinRoomDto } from 'src/dtos/joinRoomVideo.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SignalingGateway {
  @WebSocketServer()
  server!: Server;

  private rooms: JoinRoomDto[] = [];
  private socketToRoom = new Map<string, string>();

  @SubscribeMessage('join-room')
  HandlejoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomName: string; userName: string },
  ) {
    const { roomName, userName } = data;

    // find a room OR create if it does not exist
    let room = this.rooms.find((r) => r.name === roomName);
    if (!room) {
      room = { id: uuidv4(), name: roomName, users: [] };
      this.rooms.push(room);
    }

    // Add user into the room
    room.users.push(client.id);
    this.socketToRoom.set(client.id, room.id);

    // Join socket.io Room
    client.join(room.id);

    // Notify other user in the Room
    client.to(room.id).emit('user-joined', {
      userId: client.id,
      userName,
    });

    // send exisitng list users to new User
    const existingUsers = room.users.filter((id) => id !== client.id);
    client.emit('room-users', existingUsers);

    console.log(`User ${userName} ${client.id} joined room ${roomName}`);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { target: string; offer: any; caller: string },
  ) {
    console.log('Offer event from backend listened');
    const { target, offer, caller } = data;
    this.server.to(target).emit('offer', { offer, caller });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { target: string; answer: any },
  ) {
    const { answer, target } = data;
    this.server.to(target).emit('answer', { answer, answerer: client.id });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { target: string; candidate: any },
  ) {
    const { target, candidate } = data;
    this.server
      .to(target)
      .emit('ice-candidate', { candidate, sender: client.id });
  }

  handleDisconnect(client: Socket) {
    // Find which user was in
    const roomId = this.socketToRoom.get(client.id);
    if (roomId) {
      // Find the room
      const roomIndex = this.rooms.findIndex((room) => room.id === roomId);
      if (roomIndex >= 0) {
        // Remove user from the ROOM
        const room = this.rooms[roomIndex];
        room.users = room.users.filter((id) => id !== client.id);

        // If room is Empty remove it
        if (room.users.length === 0) {
          this.rooms.splice(roomIndex, 1);
        } else {
          //Notify other user about the Connection
          client.to(roomId).emit('user-disconnected', client.id);
        }
      }

      //Remove from Mapping
      this.socketToRoom.delete(client.id);
    }

    console.log(`User ${client.id} disconnected`);
  }
}
