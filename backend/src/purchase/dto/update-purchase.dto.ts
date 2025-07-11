import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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

export class UpdatePurchaseDto {
  @ApiProperty({
    description: 'Tipo de documento de la compra',
    enum: TipoDocumentoCompra,
    example: TipoDocumentoCompra.FACTURA,
    required: false,
  })
  @IsOptional()
  @IsEnum(TipoDocumentoCompra)
  tipoDocumento?: TipoDocumentoCompra;

  @ApiProperty({
    description: 'Número del documento de compra',
    maxLength: 20,
    example: 'F-001-00000123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numeroDocumento?: string;

  @ApiProperty({
    description: 'ID del proveedor',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  proveedorId?: string;

  @ApiProperty({
    description: 'Fecha de emisión del documento',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de emisión debe ser una fecha válida' },
  )
  fechaEmision?: string;

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
    required: false,
  })
  @IsOptional()
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
  subtotalNeto?: number;

  @ApiProperty({
    description: 'Monto del IVA',
    type: 'number',
    format: 'decimal',
    example: 19000.1,
    required: false,
  })
  @IsOptional()
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
  montoIva?: number;

  @ApiProperty({
    description: 'Total de la compra (subtotal + IVA)',
    type: 'number',
    format: 'decimal',
    example: 119000.6,
    required: false,
  })
  @IsOptional()
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
  total?: number;

  @ApiProperty({
    description: 'Estado de la compra',
    enum: EstadoCompra,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoCompra)
  estado?: EstadoCompra;
}
