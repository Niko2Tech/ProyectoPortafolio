import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AbrirCajaDto {
  @ApiProperty({ description: 'Monto de apertura de la caja' })
  @IsNotEmpty()
  @IsNumber()
  montoApertura: number;

  @ApiProperty({ description: 'ID del usuario que abre la caja' })
  @IsNotEmpty()
  @IsUUID()
  usuarioId: string;
}
