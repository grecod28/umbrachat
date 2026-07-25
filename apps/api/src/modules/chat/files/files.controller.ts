import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('download-url')
  @ApiOperation({
    summary: 'Get a presigned download URL for a file',
    description:
      'Returns a presigned GET URL to download a file from S3 by its key. The URL expires in 1 hour.',
  })
  @ApiQuery({ name: 'key', description: 'S3 object key', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Presigned download URL',
  })
  async getDownloadUrl(@Query('key') key: string) {
    const url = await this.filesService.getDownloadUrl(key);
    return { url };
  }
}
