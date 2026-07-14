import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { FetchMessagesDto } from '../dto/fetch-messages.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createMessage(data: CreateMessageDto) {
    return this.prismaService.$transaction(async (tx) => {
      const message = await tx.message.create({
        data,
      });

      await tx.room.update({
        where: { id: data.roomId },
        data: { lastMessageAt: new Date() },
      });

      return message;
    });
  }

  async findByRoom(data: FetchMessagesDto) {
    if (!data.afterThan) return []; // Si se acaba de unir al chat

    return await this.prismaService.message.findMany({
      where: { roomId: data.roomId, createdAt: { gt: data.afterThan } },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
