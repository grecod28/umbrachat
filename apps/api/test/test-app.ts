import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { S3Service } from '../src/infrastructure/s3/s3.service';

/**
 * S3 is a paid third-party service. It is the ONLY external service replaced
 * in this suite. PostgreSQL, Prisma, NestJS, JWT, bcrypt, controllers, guards
 * and validators all run for real.
 */
export const s3Stub = {
  getUploadSignedUrl(key: string, contentType: string) {
    return Promise.resolve({
      url: 'https://s3.test/upload',
      fields: {
        key,
        'Content-Type': contentType,
        policy: 'test-policy',
      },
    });
  },
  getDownloadSignedUrl(key: string) {
    return Promise.resolve(
      `https://s3.test/download/${encodeURIComponent(key)}`,
    );
  },
  deleteFile() {
    return Promise.resolve();
  },
};

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(S3Service)
    .useValue(s3Stub as unknown as S3Service)
    .compile();

  const app = moduleRef.createNestApplication();

  // Mirror the production bootstrap so DTO validation behaves exactly the same.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();

  return {
    app,
    prisma: app.get(PrismaService),
  };
}

function testDatabaseTarget(): string {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) return 'DATABASE_URL is not defined';

  try {
    const url = new URL(rawUrl);
    return `${url.hostname}:${url.port || '5432'}${url.pathname}`;
  } catch {
    return 'DATABASE_URL is invalid';
  }
}

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "File", "Message", "ChatItem", "RoomAccess", "Room" RESTART IDENTITY CASCADE',
    );
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);

    throw new Error(
      [
        `Could not reset the test database at ${testDatabaseTarget()}.`,
        'Is PostgreSQL running? Run `pnpm db:test:up` and `pnpm db:test:migrate` from the repository root.',
        `Cause: ${cause}`,
      ].join(' '),
      { cause: error },
    );
  }
}
