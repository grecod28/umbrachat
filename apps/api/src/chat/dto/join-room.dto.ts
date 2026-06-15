import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({
    description: 'Room ID to join',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  roomId!: string;

  @ApiPropertyOptional({
    description: 'JWT access token (required for private rooms)',
    minLength: 40,
    maxLength: 2048,
  })
  @IsOptional()
  @IsString()
  @Length(40, 2048, { message: 'El token tiene una longitud inválida' })
  token?: string;
}
