import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AccessRoomDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  password!: string;
}
