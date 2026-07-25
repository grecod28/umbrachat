import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { FetchMessagesDto } from '../dto/fetch-messages.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createMessage({ roomId, content }: CreateMessageDto) {
    return this.prismaService.$transaction(async (tx) => {
      const chatItem = await tx.chatItem.create({
        data: { roomId },
      });

      const message = await tx.message.create({
        data: { itemId: chatItem.id, content },
      });

      await tx.room.update({
        where: { id: roomId },
        data: { lastMessageAt: new Date() },
      });

      return {
        ...chatItem,
        ...message,
      };
    });
  }

  async findByRoom({ roomId, afterThan }: FetchMessagesDto) {
    if (!afterThan) return [];

    return this.prismaService.chatItem.findMany({
      where: {
        roomId,
        createdAt: {
          gt: afterThan,
        },
      },
      include: {
        message: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
