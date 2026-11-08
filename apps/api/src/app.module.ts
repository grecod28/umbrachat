import { Module, type ExecutionContext } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ChatModule } from './modules/chat/chat.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { S3Module } from './infrastructure/s3/s3.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import type Redis from 'ioredis';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { REDIS_CLIENT, RedisModule } from './infrastructure/redis/redis.module';

type RateLimitRequest = {
  anonymousSession?: { id: string };
};

function getHttpRequest(context: ExecutionContext): RateLimitRequest {
  return context.switchToHttp().getRequest<RateLimitRequest>();
}

function sessionTracker(req: Record<string, unknown>): string {
  const session = (req as RateLimitRequest).anonymousSession;
  return `session:${session?.id ?? 'unknown'}`;
}

function skipSessionThrottler(context: ExecutionContext): boolean {
  if (context.getType() !== 'http') return true;
  return !getHttpRequest(context)?.anonymousSession;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService, REDIS_CLIENT],
      useFactory: (configService: ConfigService, redis: Redis) => {
        const ipLimit = Number(
          configService.get<string>('IP_THROTTLE_LIMIT') ??
            configService.get<string>('THROTTLE_LIMIT') ??
            120,
        );
        const sessionLimit = Number(
          configService.get<string>('SESSION_THROTTLE_LIMIT') ?? 60,
        );
        const blockDuration = Number(
          configService.get<string>('THROTTLE_BLOCK_MS') ?? 5 * 60 * 1000,
        );

        return {
          throttlers: [
            {
              name: 'ip',
              ttl: 60_000,
              limit: ipLimit,
              blockDuration,
            },
            {
              name: 'session',
              ttl: 60_000,
              limit: sessionLimit,
              blockDuration,
              skipIf: skipSessionThrottler,
              getTracker: sessionTracker,
            },
          ],
          storage: new ThrottlerStorageRedisService(redis),
        };
      },
    }),
    PrismaModule,
    ChatModule,
    AuthModule,
    S3Module,
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
