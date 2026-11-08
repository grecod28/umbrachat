import { Controller, Header, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnonymousSessionService } from './anonymous-session.service';

@ApiTags('Session')
@Controller('session')
export class AnonymousSessionController {
  constructor(
    private readonly anonymousSessionService: AnonymousSessionService,
  ) {}

  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Create an anonymous session token',
    description:
      'Issues a short-lived signed token used to identify an anonymous client for rate limiting. Send it in the x-umbra-session header or as a Socket.IO auth.sessionToken.',
  })
  @ApiResponse({
    status: 200,
    description: 'Anonymous session issued',
  })
  @ApiResponse({ status: 429, description: 'Too many session requests' })
  issue() {
    return this.anonymousSessionService.issue();
  }
}
