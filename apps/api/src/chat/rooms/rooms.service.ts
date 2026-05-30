import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(createRoomDto: CreateRoomDto) {
    return await this.prisma.room.create({ data: createRoomDto });
  }

  async deleteRoom(id: string) {
    return await this.prisma.room.delete({ where: { id: id } });
  }
}
