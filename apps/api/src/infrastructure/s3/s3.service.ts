// s3/s3.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import type { PresignedPost } from '@aws-sdk/s3-presigned-post';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName =
      this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.logger.log(
      `S3Client inicializado — bucket: ${this.bucketName}, región: ${this.configService.get('AWS_REGION')}`,
    );
  }

  /**
   * Genera una URL firmada para SUBIR un archivo (POST) con límite de 0-5 MB.
   * @param key Ruta/nombre del objeto en el bucket (ej: `avatars/${userId}/${uuid}.jpg`)
   * @param contentType Content-Type que quedará bloqueado en la firma
   * @param expiresIn Expiración en segundos (por defecto 5 minutos)
   */
  async getUploadSignedUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<PresignedPost> {
    const FIVE_MB = 5 * 1024 * 1024;

    const { url, fields } = await createPresignedPost(this.s3Client, {
      Bucket: this.bucketName,
      Key: key,
      Conditions: [['content-length-range', 0, FIVE_MB]],
      Fields: {
        'Content-Type': contentType,
      },
      Expires: expiresIn,
    });

    this.logger.debug(
      `Signed upload POST URL generada para key: ${key} (expira en ${expiresIn}s)`,
    );

    return { url, fields };
  }

  /**
   * Genera una URL firmada para DESCARGAR/leer un archivo (GET).
   * @param key Ruta del objeto en el bucket
   * @param expiresIn Expiración en segundos (por defecto 1 hora)
   */
  async getDownloadSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    this.logger.debug(
      `Signed download URL generada para key: ${key} (expira en ${expiresIn}s)`,
    );

    return url;
  }

  /**
   * Elimina un objeto del bucket directamente (no requiere signed URL).
   */
  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
    this.logger.debug(`Archivo eliminado: ${key}`);
  }
}
