import { Module } from '@nestjs/common';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [RoomsModule, MessagesModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
