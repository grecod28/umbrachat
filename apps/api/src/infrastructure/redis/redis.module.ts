import {
  Global,
  Inject,
  Logger,
  Module,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<Redis> => {
        const logger = new Logger('Redis');
        const url =
          configService.get<string>('REDIS_URL') ?? 'redis://127.0.0.1:6379';

        const client = new Redis(url, {
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 2,
          connectTimeout: 5_000,
        });

        client.on('error', (error) => {
          logger.error(`Redis: ${error.message}`);
        });

        let startupTimer: ReturnType<typeof setTimeout> | undefined;

        try {
          await Promise.race([
            client.connect().then(() => client.ping()),
            new Promise<never>((_, reject) => {
              startupTimer = setTimeout(
                () => reject(new Error('timeout de conexión a Redis')),
                10_000,
              );
            }),
          ]);
          logger.log('Redis conectado');
          return client;
        } catch (error) {
          logger.error(
            `No se pudo conectar a Redis: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          client.disconnect();
          throw error;
        } finally {
          if (startupTimer) clearTimeout(startupTimer);
        }
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit().catch(() => this.redis.disconnect());
  }
}
