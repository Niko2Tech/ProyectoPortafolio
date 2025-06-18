import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'SKU único del producto' })
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Código de barras del producto',
    required: false,
  })
  @ApiProperty({ description: 'SKU único del producto' })
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  @IsString()
  codigoBarras: string;

  @ApiProperty({ description: 'Nombre del producto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Descripción del producto',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ description: 'Precio neto del producto' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('El valor debe ser un número o string válido');
  })
  precioNeto: number;

  @ApiProperty({ description: 'Precio de venta del producto' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('El valor debe ser un número o string válido');
  })
  precioVenta: number;

  @ApiProperty({ description: 'Costo neto del producto' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('El valor debe ser un número o string válido');
  })
  costoNeto: number;

  @ApiProperty({ description: 'Stock actual del producto' })
  @IsInt()
  stockActual: number;

  @ApiProperty({ description: 'Stock mínimo del producto' })
  @IsInt()
  stockMinimo: number;

  @ApiProperty({
    description: 'Unidad de medida del producto (ej: unidad, caja, kg)',
    required: false,
  })
  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @ApiProperty({ description: 'ID de la categoría del producto' })
  @IsInt()
  categoriaId: number;

  @ApiProperty({
    description: 'ID de la subcategoría del producto',
    required: false,
  })
  @IsOptional()
  @IsInt()
  subcategoriaId?: number;

  @ApiProperty({
    description: 'ID de la marca del producto',
    required: false,
  })
  @IsOptional()
  @IsInt()
  marcaId?: number;

  @ApiProperty({
    description: 'ID del proveedor del producto',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  proveedorId?: string;

  @ApiProperty({
    description: 'Indica si el producto está afecto a IVA',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  afectoIva?: boolean = true;
}
