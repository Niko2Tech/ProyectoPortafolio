import { ApiProperty } from '@nestjs/swagger';

export class Category {
  @ApiProperty({ description: 'ID numérico de la categoría' })
  id: number;

  @ApiProperty({ description: 'Nombre de la categoría' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción opcional de la categoría',
    required: false,
  })
  descripcion?: string;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }
}
