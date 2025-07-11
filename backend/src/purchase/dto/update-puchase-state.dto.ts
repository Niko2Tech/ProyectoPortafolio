import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoCompra {
  PENDIENTE = 'pendiente',
  RECIBIDA = 'recibida',
  PAGADA = 'pagada',
  ANULADA = 'anulada',
}

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la compra',
    enum: EstadoCompra,
    example: EstadoCompra.RECIBIDA,
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(EstadoCompra)
  estado: EstadoCompra;

  @ApiProperty({
    description: 'ID del usuario que realiza el cambio de estado',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  usuarioId?: string;
}
