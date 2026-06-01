import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class JoinRoomDto {
  @IsUUID()
  roomId!: string;

  @IsOptional()
  @IsString()
  @Length(40, 2048, { message: 'El token tiene una longitud inválida' })
  token?: string;
}
