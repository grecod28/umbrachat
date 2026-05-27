import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from 'src/dto/create-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createMessage(data: CreateMessageDto) {
    return await this.prismaService.message.create({
      data,
    });
  }
}
