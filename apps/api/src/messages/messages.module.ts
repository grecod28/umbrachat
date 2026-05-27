import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { TasksService } from './services/tasks.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [MessagesService, TasksService],
})
export class MessagesModule {}
