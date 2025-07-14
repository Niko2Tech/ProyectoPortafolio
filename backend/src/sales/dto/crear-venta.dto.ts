import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TipoDocumentoVenta, EstadoDocumentoVenta } from '@prisma/client';
import { Type } from 'class-transformer';

export class CrearVentaDetalleDto {
  @ApiProperty({ description: 'ID del documento' })
  @IsNotEmpty()
  @IsUUID()
  documentoId: string;

  @ApiProperty({ description: 'ID del producto' })
  @IsNotEmpty()
  @IsUUID()
  productoId: string;

  @ApiProperty({ description: 'Cantidad' })
  @IsNotEmpty()
  @IsNumber()
  cantidad: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNotEmpty()
  @IsNumber()
  precioUnitario: number;

  @ApiProperty({ description: 'Descuento porcentaje' })
  @IsNotEmpty()
  @IsNumber()
  descuentoPorcentaje: number;

  @ApiProperty({ description: 'Total de la línea' })
  @IsNotEmpty()
  @IsNumber()
  totalLinea: number;
}

export class CrearVentaDto {
  @ApiProperty({ description: 'Tipo de documento' })
  @IsNotEmpty()
  @IsEnum(TipoDocumentoVenta)
  tipoDocumento: TipoDocumentoVenta;

  @ApiProperty({ description: 'ID del usuario' })
  @IsNotEmpty()
  @IsUUID()
  usuarioId: string;

  @ApiProperty({ description: 'ID del cliente' })
  @IsNotEmpty()
  @IsUUID()
  clienteId: string;

  @ApiProperty({ description: 'Fecha de emisión' })
  @IsNotEmpty()
  @IsDateString()
  fechaEmision: Date;

  @ApiProperty({ description: 'Subtotal neto' })
  @IsNotEmpty()
  @IsNumber()
  subtotalNeto: number;

  @ApiProperty({ description: 'Monto de IVA' })
  @IsNotEmpty()
  @IsNumber()
  montoIva: number;

  @ApiProperty({ description: 'Total' })
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'ID del método de pago' })
  @IsNotEmpty()
  @IsNumber()
  metodoPagoId: number;

  @ApiProperty({ description: 'Estado' })
  @IsNotEmpty()
  @IsEnum(EstadoDocumentoVenta)
  estado: EstadoDocumentoVenta;

  @ApiProperty({
    description: 'Detalles de la venta',
    type: CrearVentaDetalleDto,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearVentaDetalleDto)
  detalles: CrearVentaDetalleDto[];
}
