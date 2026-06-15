import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ROOM_VISIBILITY, type RoomVisibility } from '@repo/shared';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
export class CreateRoomDto {
  @ApiPropertyOptional({
    description: 'Name of the chat room',
    maxLength: 120,
    example: 'My Chat Room',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the chat room',
    maxLength: 2048,
    example: 'A room to talk about anything',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  description?: string;

  @ApiProperty({
    description: 'Room visibility',
    enum: ROOM_VISIBILITY,
    example: ROOM_VISIBILITY.PUBLIC,
  })
  @IsEnum(ROOM_VISIBILITY)
  visibility!: RoomVisibility;

  @ApiPropertyOptional({
    description: '6-character password (required for private rooms)',
    minLength: 6,
    maxLength: 6,
    example: 'a1b2c3',
  })
  @ValidateIf((o: CreateRoomDto) => o.visibility === ROOM_VISIBILITY.PRIVATE)
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  password?: string;
}
