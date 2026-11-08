import { ParseUUIDPipe, UnauthorizedException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages/services/messages.service';
import { CreateMessageDto } from './messages/dto/create-message.dto';
import { FilesService } from './files/files.service';
import { CreateFilesDto } from './files/dto/create-file-record.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { RoomsService } from './rooms/rooms.service';
import { JwtService } from '@nestjs/jwt';
import { ChatPayload } from 'src/modules/auth/types/payload';
import { ANONYMOUS_SESSION_HEADER } from 'src/modules/auth/anonymous-session.constants';
import { AnonymousSessionService } from 'src/modules/auth/anonymous-session.service';
import { WsRateLimitService } from './services/ws-rate-limit.service';

const RATE_LIMITS = {
  connect: { ip: 10, session: 5, windowMs: 60_000 },
  joinRoom: { ip: 30, session: 20, windowMs: 60_000 },
  leaveRoom: { ip: 30, session: 20, windowMs: 60_000 },
  typing: { ip: 30, session: 15, windowMs: 10_000 },
  message: { ip: 15, session: 5, windowMs: 5_000 },
  files: { ip: 6, session: 3, windowMs: 60_000 },
} as const;

type SocketRateLimit = {
  ip: number;
  session: number;
  windowMs: number;
};

type ChatSocketData = {
  anonymousSessionId?: string;
  ip?: string;
};

@WebSocketGateway(Number(process.env.WS_PORT ?? 3002), {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://umbrachat.org',
      'https://www.umbrachat.org',
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    private readonly roomsService: RoomsService,
    private readonly filesService: FilesService,
    private readonly anonymousSessions: AnonymousSessionService,
    private readonly rateLimiter: WsRateLimitService,
  ) {}

  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    server.use((socket, next) => {
      void this.authenticateSocket(socket)
        .then(() => next())
        .catch((error: Error) => next(error));
    });
  }

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

  @SubscribeMessage('user-typing')
  async handleUserTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    if (!data?.roomId || typeof data.isTyping !== 'boolean') return;

    const { roomId, isTyping } = data;
    const rate = await this.checkRate(client, 'typing', RATE_LIMITS.typing);

    if (!rate.allowed) {
      return this.rejectRateLimited(client, 'user-typing', rate.retryAfterMs);
    }

    if (!client.rooms.has(roomId)) {
      return;
    }

    this.server.to(roomId).emit('user-typing', { userId: client.id, isTyping });
  }

  @SubscribeMessage('join-room')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    const rate = await this.checkRate(
      client,
      'join-room',
      RATE_LIMITS.joinRoom,
    );

    if (!rate.allowed) {
      return this.rejectRateLimited(client, 'join-room', rate.retryAfterMs);
    }

    if (!data?.roomId) {
      return client.emit('reply', {
        success: false,
        error: 'Invalid room',
      });
    }

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
    const rate = await this.checkRate(
      client,
      'leave-room',
      RATE_LIMITS.leaveRoom,
    );

    if (!rate.allowed) {
      return this.rejectRateLimited(client, 'leave-room', rate.retryAfterMs);
    }

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
    const rate = await this.checkRate(
      client,
      'send-message',
      RATE_LIMITS.message,
    );

    if (!rate.allowed) {
      return this.rejectRateLimited(client, 'send-message', rate.retryAfterMs);
    }

    const roomId = data?.roomId;
    const content = data?.content?.trim();

    if (!roomId || !content || content.length > 2048) {
      return client.emit('reply', {
        success: false,
        error: 'Invalid message',
      });
    }

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
      id: msg.id,
    });
    this.server.to(roomId).emit('new-message', {
      ...msg,
    });
  }

  @SubscribeMessage('send-files')
  async handleFileSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateFilesDto,
  ) {
    const rate = await this.checkRate(client, 'send-files', RATE_LIMITS.files);

    if (!rate.allowed) {
      return this.rejectRateLimited(client, 'send-files', rate.retryAfterMs);
    }

    const roomId = data?.roomId;
    const files = data?.files;

    if (
      !roomId ||
      !Array.isArray(files) ||
      files.length === 0 ||
      files.length > 10
    ) {
      return client.emit('reply', {
        success: false,
        error: 'Invalid files',
      });
    }

    if (!client.rooms.has(roomId)) {
      return client.emit('reply', {
        success: false,
        error: 'Not joined to room',
      });
    }

    const records = await this.filesService.createFileRecords(roomId, files);

    client.emit('reply', {
      success: true,
      ids: records.map((r) => r.id),
    });

    for (const record of records) {
      this.server.to(roomId).emit('new-message', record);
    }
  }

  private socketData(client: Socket): ChatSocketData {
    return client.data as unknown as ChatSocketData;
  }

  private async authenticateSocket(client: Socket): Promise<void> {
    const token = this.readSessionToken(client);

    if (!token) throw new Error('SESSION_REQUIRED');

    try {
      const session = await this.anonymousSessions.verify(token);
      const data = this.socketData(client);
      data.anonymousSessionId = session.id;
      data.ip = this.getClientIp(client);
    } catch {
      throw new Error('INVALID_SESSION');
    }

    const rate = await this.checkRate(client, 'connect', RATE_LIMITS.connect);

    if (!rate.allowed) {
      throw new Error('RATE_LIMITED');
    }
  }

  private readSessionToken(client: Socket): string | undefined {
    const auth = client.handshake.auth as
      | { sessionToken?: unknown }
      | undefined;

    if (typeof auth?.sessionToken === 'string' && auth.sessionToken.trim()) {
      return auth.sessionToken.trim();
    }

    const header = client.handshake.headers[ANONYMOUS_SESSION_HEADER];
    const headerValue = Array.isArray(header) ? header[0] : header;

    if (headerValue?.trim()) return headerValue.trim();

    const authorization = client.handshake.headers.authorization;

    if (authorization?.toLowerCase().startsWith('bearer ')) {
      return authorization.slice(7).trim() || undefined;
    }

    return undefined;
  }

  private getClientIp(client: Socket): string {
    const forwarded = client.handshake.headers['x-forwarded-for'];
    const forwardedIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      ?.split(',')[0]
      ?.trim();

    return (
      forwardedIp ||
      (client.handshake.headers['x-real-ip'] as string | undefined) ||
      client.handshake.address ||
      'unknown'
    );
  }

  private async checkRate(
    client: Socket,
    action: string,
    limits: SocketRateLimit,
  ): Promise<{ allowed: boolean; retryAfterMs: number }> {
    const data = this.socketData(client);
    const ip = data.ip;
    const sessionId = data.anonymousSessionId;

    if (!ip || !sessionId) return { allowed: false, retryAfterMs: 0 };

    const [ipResult, sessionResult] = await Promise.all([
      this.rateLimiter.consume(
        `ip:${ip}:${action}`,
        limits.ip,
        limits.windowMs,
      ),
      this.rateLimiter.consume(
        `session:${sessionId}:${action}`,
        limits.session,
        limits.windowMs,
      ),
    ]);

    return {
      allowed: ipResult.allowed && sessionResult.allowed,
      retryAfterMs: Math.max(ipResult.retryAfterMs, sessionResult.retryAfterMs),
    };
  }

  private rejectRateLimited(
    client: Socket,
    action: string,
    retryAfterMs: number,
  ): void {
    client.emit('rate-limited', {
      action,
      retryAfterMs,
      error: 'RATE_LIMITED',
    });
    client.emit('reply', {
      success: false,
      error: 'RATE_LIMITED',
      retryAfterMs,
    });
  }
}
