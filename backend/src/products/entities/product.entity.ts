import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductResponseEntity {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  sku: string;

  @Expose()
  @ApiProperty({ required: false })
  codigoBarras?: string;

  @Expose()
  @ApiProperty()
  nombre: string;

  @Expose()
  @ApiProperty({ required: false })
  descripcion?: string;

  @Expose()
  @ApiProperty()
  precioNeto: number;

  @Expose()
  @ApiProperty()
  iva: number;

  @Expose()
  @ApiProperty()
  precioVenta: number;

  @Expose()
  @ApiProperty()
  costoNeto: number;

  @Expose()
  @ApiProperty()
  stockActual: number;

  @Expose()
  @ApiProperty()
  stockMinimo: number;

  @Expose()
  @ApiProperty({ required: false })
  unidadMedida?: string;

  @Expose()
  @ApiProperty()
  categoriaId: number;

  @Expose()
  @ApiProperty({ required: false })
  subcategoriaId?: number;

  @Expose()
  @ApiProperty({ required: false })
  marcaId?: number;

  @Expose()
  @ApiProperty({ required: false })
  proveedorId?: string;

  @Expose()
  @ApiProperty()
  afectoIva: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<ProductResponseEntity>) {
    Object.assign(this, partial);
  }
}
