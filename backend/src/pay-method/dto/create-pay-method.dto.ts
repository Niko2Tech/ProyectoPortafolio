import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayMethodDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Código del método de pago',
    example: 'EFECTIVO',
  })
  codigo: string;

  @ApiProperty({
    description: 'Nombre del método de pago',
    example: 'Efectivo',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Activo',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  activo: boolean;
}
