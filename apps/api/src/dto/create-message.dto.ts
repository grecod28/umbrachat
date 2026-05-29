import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Prisma } from '@repo/database';

// Fuerza a que el DTO siga la estructura de Prisma.UncheckedCreateInput
export class CreateMessageDto implements Partial<Prisma.MessageUncheckedCreateInput> {
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2048)
  content!: string;

  @IsUUID()
  roomId!: string;
}
