import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseEntity {
  @ApiProperty({ description: 'ID numérico de la categoría' })
  id: number;

  @ApiProperty({ description: 'Nombre de la categoría' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción opcional de la categoría',
    required: false,
  })
  descripcion?: string;

  constructor(partial: Partial<CategoryResponseEntity>) {
    Object.assign(this, partial);
  }
}
