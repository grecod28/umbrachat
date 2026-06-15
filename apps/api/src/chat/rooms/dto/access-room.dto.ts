import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class AccessRoomDto {
  @ApiProperty({
    description: '6-character room access password',
    minLength: 6,
    maxLength: 6,
    example: 'A1B2C3',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  password!: string;
}
