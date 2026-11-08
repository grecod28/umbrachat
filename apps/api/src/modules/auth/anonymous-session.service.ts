import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import {
  ANONYMOUS_SESSION_AUDIENCE,
  ANONYMOUS_SESSION_TTL_SECONDS,
  ANONYMOUS_SESSION_TYPE,
  type AnonymousSession,
} from './anonymous-session.constants';

type SessionTokenPayload = {
  type?: string;
  sub?: string;
};

@Injectable()
export class AnonymousSessionService {
  constructor(private readonly jwtService: JwtService) {}

  async issue(): Promise<{
    token: string;
    sessionId: string;
    expiresAt: string;
  }> {
    const sessionId = randomUUID();
    const token = await this.jwtService.signAsync(
      { type: ANONYMOUS_SESSION_TYPE },
      {
        subject: sessionId,
        audience: ANONYMOUS_SESSION_AUDIENCE,
        expiresIn: ANONYMOUS_SESSION_TTL_SECONDS,
      },
    );

    return {
      token,
      sessionId,
      expiresAt: new Date(
        Date.now() + ANONYMOUS_SESSION_TTL_SECONDS * 1000,
      ).toISOString(),
    };
  }

  async verify(token: string): Promise<AnonymousSession> {
    try {
      const payload = await this.jwtService.verifyAsync<SessionTokenPayload>(
        token,
        { audience: ANONYMOUS_SESSION_AUDIENCE },
      );

      if (payload.type !== ANONYMOUS_SESSION_TYPE || !payload.sub) {
        throw new UnauthorizedException();
      }

      return { id: payload.sub };
    } catch {
      throw new UnauthorizedException(
        'Sesión anónima inválida o expirada. Solicita una nueva en POST /session.',
      );
    }
  }
}
