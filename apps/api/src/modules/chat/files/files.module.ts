import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { S3Module } from 'src/infrastructure/s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
