import { ApiProperty } from '@nestjs/swagger';
import { TipoMovimientoCaja, TipoDocumentoVenta } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsUUID, IsEnum } from 'class-validator';

export class CajaAbiertaMovimientoDto {
  @ApiProperty({ description: 'ID de la caja' })
  @IsNotEmpty()
  @IsUUID()
  cajaId: string;

  @ApiProperty({ description: 'Tipo de movimiento' })
  @IsNotEmpty()
  @IsEnum(TipoMovimientoCaja)
  tipoMovimiento: TipoMovimientoCaja;

  @ApiProperty({ description: 'ID del método de pago' })
  @IsNotEmpty()
  @IsNumber()
  metodoPagoId: number;

  @ApiProperty({ description: 'Monto' })
  @IsNotEmpty()
  @IsNumber()
  monto: number;

  @ApiProperty({ description: 'ID del documento' })
  @IsNotEmpty()
  @IsUUID()
  documentoId: string;

  @ApiProperty({ description: 'Tipo de documento' })
  @IsNotEmpty()
  @IsEnum(TipoDocumentoVenta)
  tipoDocumento: TipoDocumentoVenta;

  @ApiProperty({ description: 'ID del usuario' })
  @IsNotEmpty()
  @IsUUID()
  usuarioId: string;
}
