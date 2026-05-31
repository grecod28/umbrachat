import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';

@Injectable()
export class RoomsService {
  private readonly pageSize = 20;
  constructor(private prisma: PrismaService) {}

  async searchRooms({ name, page = 1 }: SearchRoomsDto) {
    const skip = (page - 1) * this.pageSize;

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive', // Búsqueda que ignora mayúsculas/minúsculas
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
        skip: skip,
        take: this.pageSize,
      }),
      this.prisma.room.count({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / this.pageSize),
      },
    };
  }

  async getRoom(roomId: string) {
    return await this.prisma.room.findUnique({
      where: { id: roomId },
    });
  }

  async createRoom(createRoomDto: CreateRoomDto) {
    return await this.prisma.room.create({ data: createRoomDto });
  }

  async deleteRoom(id: string) {
    return await this.prisma.room.delete({ where: { id: id } });
  }
}
