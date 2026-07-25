import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [AuthModule, FilesModule],
  providers: [RoomsService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
