import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from 'src/infrastructure/s3/s3.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import type { FileEntryDto } from '../rooms/dto/upload-url.dto';
import type { FileRecordDto } from './dto/create-file-record.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
  ) {}

  async generateUploadUrls(
    roomId: string,
    files: FileEntryDto[],
  ): Promise<{
    files: { key: string; url: string; fields: Record<string, string> }[];
  }> {
    const result = await Promise.all(
      files.map(async (file) => {
        const fileId = crypto.randomUUID();

        const key = `rooms/${roomId}/${fileId}`;
        const { url, fields } = await this.s3Service.getUploadSignedUrl(
          key,
          file.contentType,
        );

        this.logger.debug(`Signed URL para: ${key}`);

        return { key, url, fields };
      }),
    );

    this.logger.log(
      `Se generaron ${result.length} signed URLs para la sala ${roomId}`,
    );

    return { files: result };
  }

  async createFileRecords(roomId: string, files: FileRecordDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const results: {
        id: string;
        roomId: string;
        createdAt: Date;
        key: string;
        fileName: string;
        mimeType: string;
        size: number;
      }[] = [];

      for (const file of files) {
        const chatItem = await tx.chatItem.create({
          data: { roomId },
        });

        const record = await tx.file.create({
          data: {
            itemId: chatItem.id,
            key: file.key,
            fileName: file.fileName,
            mimeType: file.mimeType,
            size: file.size,
          },
        });

        await tx.room.update({
          where: { id: roomId },
          data: { lastMessageAt: new Date() },
        });

        results.push({
          id: chatItem.id,
          roomId: chatItem.roomId,
          createdAt: chatItem.createdAt,
          key: record.key,
          fileName: record.fileName,
          mimeType: record.mimeType,
          size: record.size,
        });
      }

      return results;
    });
  }
}
