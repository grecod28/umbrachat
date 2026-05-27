import { IsString, IsNotEmpty, MinLength, IsUUID } from 'class-validator';
import { Prisma } from '@repo/database';

// Forzamos a que el DTO siga la estructura de Prisma.UncheckedCreateInput
export class CreateMessageDto implements Partial<Prisma.MessageUncheckedCreateInput> {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content!: string;

  @IsUUID()
  roomId!: string;
}
