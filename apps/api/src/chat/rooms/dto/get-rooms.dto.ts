import { IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetRoomsDto {
  @IsArray()
  @IsString({ each: true }) // Valida que cada elemento sea string
  @Transform(({ value }) => {
    // Si llega como string único, lo metemos en un array
    if (typeof value === 'string') return [value];
    return value as string[];
  })
  ids!: string[];
}
