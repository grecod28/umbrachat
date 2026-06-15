import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AccessRoomDto {
  @ApiProperty({
    description: '6-character room access password',
    minLength: 6,
    maxLength: 6,
    example: 'a1b2c3',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  password!: string;
}
