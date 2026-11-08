import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { ANONYMOUS_SESSION_HEADER } from 'src/modules/auth/anonymous-session.constants';

export const REQUIRE_ANONYMOUS_SESSION_KEY = 'requireAnonymousSession';

export function RequireAnonymousSession() {
  return applyDecorators(
    SetMetadata(REQUIRE_ANONYMOUS_SESSION_KEY, true),
    ApiHeader({
      name: ANONYMOUS_SESSION_HEADER,
      required: true,
      description:
        'Token de sesión anónima obtenido en POST /session. También se acepta Authorization: Bearer <token>.',
    }),
  );
}
