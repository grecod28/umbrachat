import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  Max,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const FIVE_MB = 5 * 1024 * 1024;

export class FileEntryDto {
  @ApiProperty({
    description: 'File name with extension',
    maxLength: 256,
    example: 'photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  name!: string;

  @ApiProperty({
    description: 'MIME type of the file',
    maxLength: 128,
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  contentType!: string;

  @ApiProperty({
    description: 'File size in bytes (max 5 MB)',
    maximum: FIVE_MB,
    example: 245123,
  })
  @IsNumber()
  @Max(FIVE_MB, { message: 'Each file must not exceed 5 MB' })
  size!: number;
}

export class UploadFilesDto {
  @ApiProperty({
    description: 'List of files to get signed upload URLs for (max 10)',
    type: [FileEntryDto],
  })
  @IsArray()
  @ArrayMaxSize(10, { message: 'Maximum 10 files per request' })
  @ValidateNested({ each: true })
  @Type(() => FileEntryDto)
  files!: FileEntryDto[];
}
