import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom() {
    return await this.prisma.room.create({});
  }

  async deleteRoom(id: string) {
    return await this.prisma.room.delete({ where: { id: id } });
  }
}
