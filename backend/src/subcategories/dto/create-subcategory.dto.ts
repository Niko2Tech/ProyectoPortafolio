import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubcategoryDto {
  @ApiProperty({
    description: 'ID de la categoría a la que pertenece la subcategoría',
  })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  categoriaId: number;

  @ApiProperty({ description: 'Nombre de la subcategoría' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción de la subcategoría',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}
