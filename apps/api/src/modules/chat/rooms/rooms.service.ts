import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import * as bcrypt from 'bcrypt';
import { ROOM_VISIBILITY } from '@repo/shared';
import { AccessRoomDto } from './dto/access-room.dto';
import { GetRoomsDto } from './dto/get-rooms.dto';
import { UploadFilesDto } from './dto/upload-url.dto';
import { FileRecordDto } from '../files/dto/create-file-record.dto';
import { JwtService } from '@nestjs/jwt';
import { ChatPayload } from 'src/modules/auth/types/payload';
import { FilesService } from '../files/files.service';

@Injectable()
export class RoomsService {
  private readonly pageSize = 20;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private filesService: FilesService,
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
        lastMessageAt: 'desc',
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
            mode: 'insensitive',
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

  private async validateRoomAccess(roomId: string, accessToken?: string) {
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

        if (payload.roomId !== roomId) {
          throw new UnauthorizedException('El token no pertenece a esta sala');
        }
      } catch {
        throw new UnauthorizedException(
          'Código de acceso incorrecto o expirado',
        );
      }
    }

    return room;
  }

  async findMessagesByRoom(roomId: string, accessToken?: string) {
    await this.validateRoomAccess(roomId, accessToken);

    const items = await this.prisma.chatItem.findMany({
      where: { roomId },
      include: {
        message: true,
        file: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return items.map(({ message, file, ...item }) => ({
      ...item,
      ...(message ?? {}),
      ...(file ?? {}),
    }));
  }

  async createRoom({ name, description, visibility, password }: CreateRoomDto) {
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

  async isPrivate(roomId: string): Promise<boolean> {
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

    if (!room) throw new NotFoundException('Room doesn`t exists');

    return !!room.access;
  }

  async getUploadUrls(
    roomId: string,
    dto: UploadFilesDto,
    accessToken?: string,
  ) {
    await this.validateRoomAccess(roomId, accessToken);

    return this.filesService.generateUploadUrls(roomId, dto.files);
  }

  async createFiles(roomId: string, files: FileRecordDto[]) {
    await this.validateRoomAccess(roomId);

    return this.filesService.createFileRecords(roomId, files);
  }
}
