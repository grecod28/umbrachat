import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import * as bcrypt from 'bcrypt';
import { ROOM_VISIBILITY } from '@repo/shared';
import { AccessRoomDto } from './dto/access-room.dto';
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
          access: null,
        },
        orderBy: {
          createdAt: 'desc',
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
    // Búsqueda incluyendo selación (omito passwordhash)
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        access: {
          select: {
            roomId: true,
          },
        },
      },
    });

    if (!room) return null;

    return {
      ...room,
      isPrivate: !!room.access,
    };
  }

  async createRoom({ name, description, visibility, password }: CreateRoomDto) {
    // $transaction para que ambas operaciones sean atómicas
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          name,
          description,
        },
      });

      if (visibility === ROOM_VISIBILITY.PRIVATE) {
        if (!password) throw new Error('Code is required for private rooms');

        const passwordHash = await bcrypt.hash(password, 10);

        await tx.roomAccess.create({
          data: {
            roomId: room.id,
            passwordHash,
          },
        });
      }

      return room;
    });
  }

  async accessRoom(id: string, { password }: AccessRoomDto) {
    const room = await this.prisma.roomAccess.findUnique({
      where: { roomId: id },
    });

    if (!room) throw new NotFoundException('Room not found');

    if (!(await bcrypt.compare(password, room.passwordHash)))
      throw new UnauthorizedException('Invalid `password');

    return { success: true };
  }

  async deleteRoom(id: string) {
    return await this.prisma.room.delete({ where: { id: id } });
  }
}
