import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// Enums para los tipos de documento y estado
enum TipoDocumentoCompra {
  FACTURA = 'factura',
  BOLETA = 'boleta',
  OTRO = 'otro',
}

enum EstadoCompra {
  PENDIENTE = 'pendiente',
  RECIBIDA = 'recibida',
  PAGADA = 'pagada',
  ANULADA = 'anulada',
}

export class CreateCompraDetalleDto {
  @ApiProperty({
    description: 'ID del producto',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productoId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    type: 'number',
    format: 'decimal',
    example: 10,
  })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La cantidad debe ser un número con máximo 2 decimales' },
  )
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('La cantidad debe ser un número o string válido');
  })
  cantidad: number;

  @ApiProperty({
    description: 'Costo unitario del producto',
    type: 'number',
    format: 'decimal',
    example: 1500.5,
  })
  @IsNotEmpty({ message: 'El costo unitario es obligatorio' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo unitario debe ser un número con máximo 2 decimales' },
  )
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('El costo unitario debe ser un número o string válido');
  })
  costoUnitario: number;

  @ApiProperty({
    description: 'Total de la línea (cantidad * costo unitario)',
    type: 'number',
    format: 'decimal',
    example: 15005.0,
  })
  @IsNotEmpty({ message: 'El total de línea es obligatorio' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El total de línea debe ser un número con máximo 2 decimales' },
  )
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('El total de línea debe ser un número o string válido');
  })
  totalLinea: number;
}

export class CreateCompraDto {
  @ApiProperty({
    description: 'Tipo de documento de la compra',
    enum: TipoDocumentoCompra,
    example: TipoDocumentoCompra.FACTURA,
  })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  @IsEnum(TipoDocumentoCompra)
  tipoDocumento: TipoDocumentoCompra;

  @ApiProperty({
    description: 'Número del documento de compra',
    maxLength: 20,
    example: 'F-001-00000123',
  })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @IsString()
  @MaxLength(20)
  numeroDocumento: string;

  @ApiProperty({
    description: 'ID del proveedor',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'El ID del proveedor es obligatorio' })
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  proveedorId: string;

  @ApiProperty({
    description: 'Fecha de emisión del documento',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00Z',
  })
  @IsNotEmpty({ message: 'La fecha de emisión es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de emisión debe ser una fecha válida' },
  )
  fechaEmision: string;

  @ApiProperty({
    description: 'Fecha de recepción del documento',
    type: 'string',
    format: 'date-time',
    required: false,
    example: '2024-01-16T14:20:00Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de recepción debe ser una fecha válida' },
  )
  fechaRecepcion?: string;

  @ApiProperty({
    description: 'Subtotal neto de la compra (sin IVA)',
    type: 'number',
    format: 'decimal',
    example: 100000.5,
  })
  @IsNotEmpty({ message: 'El subtotal neto es obligatorio' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El subtotal neto debe ser un número con máximo 2 decimales' },
  )
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('El subtotal neto debe ser un número o string válido');
  })
  subtotalNeto: number;

  @ApiProperty({
    description: 'Monto del IVA',
    type: 'number',
    format: 'decimal',
    example: 19000.1,
  })
  @IsNotEmpty({ message: 'El monto del IVA es obligatorio' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto del IVA debe ser un número con máximo 2 decimales' },
  )
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('El monto del IVA debe ser un número o string válido');
  })
  montoIva: number;

  @ApiProperty({
    description: 'Total de la compra (subtotal + IVA)',
    type: 'number',
    format: 'decimal',
    example: 119000.6,
  })
  @IsNotEmpty({ message: 'El total es obligatorio' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El total debe ser un número con máximo 2 decimales' },
  )
  @Transform(({ value }) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return parseFloat(value.toString());
    }
    throw new Error('El total debe ser un número o string válido');
  })
  total: number;

  @ApiProperty({
    description: 'Estado de la compra',
    enum: EstadoCompra,
    default: EstadoCompra.PENDIENTE,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoCompra)
  estado?: EstadoCompra = EstadoCompra.PENDIENTE;

  @ApiProperty({
    description: 'Detalles de la compra (productos)',
    type: [CreateCompraDetalleDto],
    example: [
      {
        productoId: '550e8400-e29b-41d4-a716-446655440000',
        cantidad: 10,
        costoUnitario: 1500.5,
        totalLinea: 15005.0,
      },
    ],
  })
  @IsNotEmpty({ message: 'Los detalles de la compra son obligatorios' })
  @IsArray({ message: 'Los detalles deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateCompraDetalleDto)
  detalles: CreateCompraDetalleDto[];

  @ApiProperty({
    description: 'ID del usuario que registra la compra',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  usuarioId: string;
}
