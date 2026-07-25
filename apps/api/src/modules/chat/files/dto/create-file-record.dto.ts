import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

const FIVE_MB = 5 * 1024 * 1024;

export class FileRecordDto {
  @ApiProperty({
    description: 'S3 object key',
    maxLength: 512,
    example: 'rooms/abc123/def456',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  key!: string;

  @ApiProperty({
    description: 'Original file name',
    maxLength: 256,
    example: 'photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  fileName!: string;

  @ApiProperty({
    description: 'MIME type',
    maxLength: 128,
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  mimeType!: string;

  @ApiProperty({
    description: 'File size in bytes (1 B - 5 MB)',
    minimum: 1,
    maximum: FIVE_MB,
    example: 245123,
  })
  @IsInt()
  @Min(1)
  @Max(FIVE_MB)
  size!: number;
}

export class CreateFilesDto {
  @ApiProperty({
    description: 'Room UUID',
    format: 'uuid',
  })
  @IsUUID()
  roomId!: string;

  @ApiProperty({
    description: 'File records to create in the database (max 10)',
    type: [FileRecordDto],
  })
  @IsArray()
  @ArrayMaxSize(10, { message: 'Maximum 10 files per request' })
  @ValidateNested({ each: true })
  @Type(() => FileRecordDto)
  files!: FileRecordDto[];
}
