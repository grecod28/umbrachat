import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const ip =
      (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers?.['x-real-ip'] as string) ||
      (req as { ip?: string }).ip ||
      'unknown';

    return Promise.resolve(ip);
  }
}
