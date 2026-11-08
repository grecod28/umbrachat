import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  type ThrottlerStorage,
} from '@nestjs/throttler';
import {
  ANONYMOUS_SESSION_HEADER,
  type AnonymousSession,
} from 'src/modules/auth/anonymous-session.constants';
import { AnonymousSessionService } from 'src/modules/auth/anonymous-session.service';
import { REQUIRE_ANONYMOUS_SESSION_KEY } from '../decorators/require-anonymous-session.decorator';

type SessionRequest = {
  headers: Record<string, string | string[] | undefined>;
  anonymousSession?: AnonymousSession;
  anonymousSessionError?: boolean;
};

function readHeader(request: SessionRequest, name: string): string | undefined {
  const value = request.headers[name];

  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  return value?.trim() || undefined;
}

function readSessionToken(request: SessionRequest): string | undefined {
  const headerToken = readHeader(request, ANONYMOUS_SESSION_HEADER);

  if (headerToken) return headerToken;

  const authorization = readHeader(request, 'authorization');

  if (authorization?.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim() || undefined;
  }

  return undefined;
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly anonymousSessions: AnonymousSessionService,
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // WebSocket traffic has its own limiter in ChatGateway.
    if (context.getType() !== 'http') return true;

    const request = context.switchToHttp().getRequest<SessionRequest>();
    const token = readSessionToken(request);

    if (token) {
      try {
        request.anonymousSession = await this.anonymousSessions.verify(token);
      } catch {
        request.anonymousSessionError = true;
      }
    }

    // The IP throttler runs before requiring the session, so an attacker
    // cannot bypass it by sending a missing or invalid token.
    const allowed = await super.canActivate(context);

    if (!allowed) return false;

    const required = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_ANONYMOUS_SESSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (required && !request.anonymousSession) {
      throw new UnauthorizedException(
        request.anonymousSessionError
          ? 'Sesión anónima inválida o expirada. Solicita una nueva en POST /session.'
          : 'Falta el token de sesión anónima. Obtén uno en POST /session.',
      );
    }

    return true;
  }

  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const headers = req.headers as
      | Record<string, string | string[] | undefined>
      | undefined;

    const forwarded = headers?.['x-forwarded-for'];
    const forwardedIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      ?.split(',')[0]
      ?.trim();

    const ip =
      forwardedIp ||
      (headers?.['x-real-ip'] as string | undefined) ||
      (req as { ip?: string }).ip ||
      'unknown';

    return Promise.resolve(ip);
  }
}
