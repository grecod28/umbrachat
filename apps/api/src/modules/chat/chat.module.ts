import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from './messages/messages.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [MessagesModule, RoomsModule, AuthModule, FilesModule],
  providers: [ChatGateway],
})
export class ChatModule {}
