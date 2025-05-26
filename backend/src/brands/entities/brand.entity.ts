import { ApiProperty } from '@nestjs/swagger';

export class BrandResponseEntity {
  @ApiProperty({ description: 'ID numérico de la marca' })
  id: number;

  @ApiProperty({ description: 'Nombre de la marca' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción opcional de la marca',
    required: false,
  })
  descripcion?: string;

  constructor(partial: Partial<BrandResponseEntity>) {
    Object.assign(this, partial);
  }
}
