import { ParseUUIDPipe, UnauthorizedException } from '@nestjs/common';
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
import { JoinRoomDto } from './dto/join-room.dto';
import { RoomsService } from './rooms/rooms.service';
import { JwtService } from '@nestjs/jwt';
import { ChatPayload } from 'src/auth/types/payload';

@WebSocketGateway(3002, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    private readonly roomsService: RoomsService,
  ) {}

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
    @MessageBody() data: JoinRoomDto,
  ) {
    if (await this.roomsService.isPrivate(data.roomId)) {
      if (!data.token)
        throw new UnauthorizedException('Token required for this room');

      try {
        const payload: ChatPayload = await this.jwtService.verifyAsync(
          data.token,
        );

        if (payload.roomId !== data.roomId) throw new UnauthorizedException();
      } catch {
        throw new UnauthorizedException(
          'Código de acceso incorrecto o expirado',
        );
      }
    }
    console.log('Uniendose');

    await client.join(data.roomId);

    const count = this.server.sockets.adapter.rooms.get(data.roomId)?.size ?? 0;

    const messages = await this.messagesService.findByRoom(data);
    client.emit('message-history', messages);

    this.server.to(data.roomId).emit('room-update', {
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

    if (!client.rooms.has(roomId)) {
      return client.emit('reply', {
        success: false,
        error: 'Not joined to room',
      });
    }

    // Se emite a todos en la sala
    const msg = await this.messagesService.createMessage({ content, roomId });

    client.emit('reply', {
      success: true,
    });
    this.server.to(roomId).emit('new-message', {
      ...msg,
    });
  }
}
