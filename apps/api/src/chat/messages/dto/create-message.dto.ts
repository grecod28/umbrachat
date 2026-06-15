import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Message content',
    minLength: 1,
    maxLength: 2048,
    example: 'Hello everyone!',
  })
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2048)
  content!: string;

  @ApiProperty({
    description: 'ID of the room to send the message to',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  roomId!: string;
}
