// s3/s3.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
   * Genera una URL firmada para SUBIR un archivo (PUT).
   * @param key Ruta/nombre del objeto en el bucket (ej: `avatars/${userId}/${uuid}.jpg`)
   * @param contentType Content-Type que quedará bloqueado en la firma
   * @param expiresIn Expiración en segundos (por defecto 5 minutos)
   */
  async getUploadSignedUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    this.logger.debug(
      `Signed upload URL generada para key: ${key} (expira en ${expiresIn}s)`,
    );

    return url;
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
