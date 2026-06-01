import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchRoomsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional() // Opcional por si quieres un valor por defecto en el servicio
  @Type(() => Number) // Transforma el string de la URL a número
  @IsNumber()
  @Min(1) // Evita páginas cero o negativas
  page?: number;
}
