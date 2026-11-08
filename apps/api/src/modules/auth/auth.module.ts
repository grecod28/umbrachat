import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AnonymousSessionController } from './anonymous-session.controller';
import { AnonymousSessionService } from './anonymous-session.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' },
      }),
    }),
  ],
  controllers: [AnonymousSessionController],
  providers: [AnonymousSessionService],
  exports: [JwtModule, AnonymousSessionService],
})
export class AuthModule {}
