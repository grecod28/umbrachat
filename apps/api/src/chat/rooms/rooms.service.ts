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
import { GetRoomsDto } from './dto/get-rooms.dto';
import { JwtService } from '@nestjs/jwt';
import { ChatPayload } from 'src/auth/types/payload';
@Injectable()
export class RoomsService {
  private readonly pageSize = 20;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getRooms(getRoomsDto: GetRoomsDto) {
    const rooms = await this.prisma.room.findMany({
      where: {
        id: { in: getRoomsDto.ids },
      },
      include: {
        access: {
          select: {
            roomId: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc', // Ordenado por Último mensaje (por defecto al crear pone ahora)
      },
    });

    return rooms.map((room) => ({
      ...room,
      isPrivate: !!room.access?.roomId,
    }));
  }

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

  async findMessagesByRoom(roomId: string, accessToken?: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { access: true },
    });
    if (!room) throw new NotFoundException('Sala no encontrada');

    if (room.access) {
      if (!accessToken) {
        throw new UnauthorizedException(
          'Esta sala es privada y requiere una llave de acceso',
        );
      }

      try {
        const payload =
          await this.jwtService.verifyAsync<ChatPayload>(accessToken);

        // Verifica si el roomId del payload es el mismo de esta sala
        if (payload.roomId !== roomId) {
          throw new UnauthorizedException('El token no pertenece a esta sala');
        }
      } catch {
        throw new UnauthorizedException(
          'Código de acceso incorrecto o expirado',
        );
      }
    }

    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });
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

  async accessRoom(roomId: string, { password }: AccessRoomDto) {
    const room = await this.prisma.roomAccess.findUnique({
      where: { roomId },
    });

    if (!room) throw new NotFoundException('Room not found');

    if (!(await bcrypt.compare(password, room.passwordHash)))
      throw new UnauthorizedException('Invalid `password');

    const payload: ChatPayload = {
      roomId,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  async deleteRoom(id: string) {
    return await this.prisma.room.delete({ where: { id: id } });
  }
}
