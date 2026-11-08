import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from './messages/messages.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FilesModule } from './files/files.module';
import { TasksService } from './services/tasks.service';
import { WsRateLimitService } from './services/ws-rate-limit.service';

@Module({
  imports: [MessagesModule, RoomsModule, AuthModule, FilesModule],
  providers: [ChatGateway, TasksService, WsRateLimitService],
})
export class ChatModule {}
