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
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  description?: string;

  @IsEnum(ROOM_VISIBILITY)
  visibility!: RoomVisibility;

  @ValidateIf((o: CreateRoomDto) => o.visibility === ROOM_VISIBILITY.PRIVATE) // Condición
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  password?: string;
}
