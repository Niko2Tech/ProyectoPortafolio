import {
  IsEnum,
  IsOptional,
  IsInt,
  IsString,
  IsUUID,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// Enums para los filtros
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

export class PurchaseQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description:
      'Término de búsqueda (número de documento, proveedor, RUT, monto)',
    example: 'F-001-123',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  search?: string = '';

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la compra',
    enum: EstadoCompra,
    example: EstadoCompra.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(EstadoCompra, { message: 'El estado debe ser válido' })
  estado?: EstadoCompra;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de documento',
    enum: TipoDocumentoCompra,
    example: TipoDocumentoCompra.FACTURA,
  })
  @IsOptional()
  @IsEnum(TipoDocumentoCompra, {
    message: 'El tipo de documento debe ser válido',
  })
  tipoDocumento?: TipoDocumentoCompra;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del filtro (YYYY-MM-DD)',
    type: 'string',
    format: 'date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe ser válida (YYYY-MM-DD)' },
  )
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del filtro (YYYY-MM-DD)',
    type: 'string',
    format: 'date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser válida (YYYY-MM-DD)' })
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'ID del proveedor para filtrar',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  proveedorId?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por campo específico',
    enum: ['fechaEmision', 'fechaRecepcion', 'total', 'createdAt'],
    default: 'createdAt',
    example: 'fechaEmision',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['fechaEmision', 'fechaRecepcion', 'total', 'createdAt'], {
    message: 'El campo de ordenamiento debe ser válido',
  })
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'], {
    message: 'La dirección debe ser asc o desc',
  })
  orderDirection?: 'asc' | 'desc' = 'desc';
}
