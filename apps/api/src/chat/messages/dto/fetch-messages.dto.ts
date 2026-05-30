import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class FetchMessagesDto {
  @IsUUID()
  roomId!: string;

  @IsOptional()
  @IsDateString() // Valida que sea un formato ISO8601 válido
  afterThan?: string;
}
