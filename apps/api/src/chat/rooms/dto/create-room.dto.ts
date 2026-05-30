import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  description?: string;
}
