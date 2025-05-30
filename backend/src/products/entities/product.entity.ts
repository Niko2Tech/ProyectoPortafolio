import { ApiProperty } from '@nestjs/swagger';

export class ProductEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  precioNeto: string;

  @ApiProperty()
  iva: string;

  @ApiProperty()
  precioVenta: string;

  @ApiProperty()
  costoNeto: string;

  @ApiProperty()
  stockActual: number;

  @ApiProperty()
  stockMinimo: number;

  @ApiProperty()
  unidadMedida: string;

  @ApiProperty()
  afectoIva: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  marca: { nombre: string };

  @ApiProperty()
  categoria: { nombre: string };

  @ApiProperty()
  subcategoria: { nombre: string };

  @ApiProperty()
  proveedor: { nombreFantasia: string };
}
