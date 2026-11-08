import { Injectable } from '@nestjs/common';

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

@Injectable()
export class WsRateLimitService {
  private readonly buckets = new Map<string, Bucket>();
  private operations = 0;

  consume(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    this.operations += 1;
    if (this.operations % 500 === 0) this.cleanup(now);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        retryAfterMs: Math.max(1, bucket.resetAt - now),
      };
    }

    bucket.count += 1;
    return { allowed: true, retryAfterMs: 0 };
  }

  private cleanup(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
