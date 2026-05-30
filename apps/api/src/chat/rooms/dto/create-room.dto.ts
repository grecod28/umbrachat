import { ROOM_VISIBIITY } from '@repo/shared';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateRoomDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  description?: string;

  @IsEnum(ROOM_VISIBIITY)
  visibility!: ROOM_VISIBIITY;
}
