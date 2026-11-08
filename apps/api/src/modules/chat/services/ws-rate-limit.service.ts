import { Inject, Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/infrastructure/redis/redis.module';

const INCREMENT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return { count, redis.call('PTTL', KEYS[1]) }
`;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

@Injectable()
export class WsRateLimitService {
  private readonly logger = new Logger(WsRateLimitService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const redisKey = `umbra:ws-rate:${key}`;

    try {
      const result = (await this.redis.eval(
        INCREMENT_SCRIPT,
        1,
        redisKey,
        windowMs,
      )) as [number, number];

      const [count, ttl] = result;

      if (typeof count !== 'number' || typeof ttl !== 'number') {
        throw new Error('Redis devolvió un resultado de rate limit inválido');
      }

      if (count > limit) {
        return {
          allowed: false,
          retryAfterMs: Math.max(1, ttl),
        };
      }

      return { allowed: true, retryAfterMs: 0 };
    } catch (error) {
      // Fail closed: si Redis no responde, no permitimos más eventos.
      this.logger.error(
        `No se pudo aplicar el rate limit WebSocket: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return { allowed: false, retryAfterMs: 5_000 };
    }
  }
}
