import { ParseUUIDPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages/services/messages.service';
import { CreateMessageDto } from './messages/dto/create-message.dto';

@WebSocketGateway(3002)
export class ChatGateway implements OnGatewayDisconnect {
  constructor(private readonly messagesServie: MessagesService) {}

  @WebSocketServer()
  server!: Server;

  handleDisconnect(client: Socket) {
    const rooms = Array.from(client.rooms);

    // elimina socket de todas las rooms
    rooms.forEach((roomId) => {
      if (roomId === client.id) return; // socket room propia

      const count = this.server.sockets.adapter.rooms.get(roomId)?.size ?? 0;

      this.server.to(roomId).emit('room-update', {
        event: 'disconnect',
        usersInRoom: count - 1,
      });
    });
  }

  @SubscribeMessage('join-room')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId', new ParseUUIDPipe())
    roomId: string,
  ) {
    await client.join(roomId);

    const count = this.server.sockets.adapter.rooms.get(roomId)?.size ?? 0;

    this.server.to(roomId).emit('room-update', {
      event: 'join',
      usersInRoom: count,
    });
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId', new ParseUUIDPipe())
    roomId: string,
  ) {
    // Verificación de usuario dentro de la sala
    const room = this.server.sockets.adapter.rooms.get(roomId);
    if (!room || !room.has(client.id)) {
      return;
    }

    const count = this.server.sockets.adapter.rooms.get(roomId)?.size ?? 0;

    await client.leave(roomId);
    this.server.to(roomId).emit('room-update', {
      event: 'leave',
      usersInRoom: Math.max(0, count - 1),
    });
  }

  @SubscribeMessage('send-message')
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    const { roomId, content } = data;

    // Se emite a todos en la sala
    const msg = await this.messagesServie.createMessage({ content, roomId });

    this.server.to(roomId).emit('new-message', {
      ...msg,
    });
  }
}
