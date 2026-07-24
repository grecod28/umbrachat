import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from 'src/infrastructure/s3/s3.service';
import type { FileEntryDto } from '../rooms/dto/upload-url.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly s3Service: S3Service) {}

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
}
