import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://umbrachat.org',
      'https://www.umbrachat.org',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-umbra-session'],
    exposedHeaders: [
      'X-RateLimit-Limit-ip',
      'X-RateLimit-Remaining-ip',
      'X-RateLimit-Reset-ip',
      'X-RateLimit-Limit-session',
      'X-RateLimit-Remaining-session',
      'X-RateLimit-Reset-session',
      'Retry-After-ip',
      'Retry-After-session',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('UmbraChat API')
    .setDescription(
      'REST API for UmbraChat — real-time chat rooms. Create rooms, send messages, and manage access.',
    )
    .setVersion('1.0')
    .addTag('Rooms', 'Chat room operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
