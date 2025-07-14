import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoCaja } from '@prisma/client';

export class CerrarCajaDto {
  @ApiProperty({ description: 'ID de la caja' })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Monto de cierre de la caja en efectivo' })
  @IsNotEmpty()
  @IsNumber()
  montoCierre: number;

  @ApiProperty({ description: 'Comentario de la cierre de la caja' })
  @IsOptional()
  @IsString()
  comentario?: string;

  @ApiProperty({ description: 'ID del usuario que cierra la caja' })
  @IsNotEmpty()
  @IsUUID()
  usuarioId: string;

  @ApiProperty({ description: 'Estado de la caja' })
  @IsNotEmpty()
  @IsEnum(EstadoCaja)
  estado: EstadoCaja;
}
