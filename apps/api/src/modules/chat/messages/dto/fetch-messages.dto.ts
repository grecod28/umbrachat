import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class FetchMessagesDto {
  @ApiProperty({
    description: 'Room ID to fetch messages from',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  roomId!: string;

  @ApiPropertyOptional({
    description: 'Fetch messages created after this ISO date',
    format: 'date-time',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  afterThan?: string;
}
