import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class FetchMessagesDto {
  @IsUUID()
  roomId!: string;

  @IsDateString() // Valida que sea un formato ISO8601 válido
  @IsNotEmpty()
  afterThan!: string;
}
