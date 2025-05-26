import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsRut } from 'src/utils/rut.util';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Razón social del proveedor' })
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @IsString({ message: 'Debe ser un texto' })
  razonSocial: string;

  @ApiProperty({
    description: 'Nombre de fantasía del proveedor',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  nombreFantasia?: string;

  @ApiProperty({ description: 'RUT del proveedor (formato XX.XXX.XXX-X)' })
  @IsNotEmpty({ message: 'El RUT es obligatorio' })
  @IsString({ message: 'Debe ser un texto' })
  @Length(9, 12, { message: 'El RUT debe tener entre 9 y 12 caracteres' })
  @IsRut({ message: 'El RUT no es válido' })
  rut: string;

  @ApiProperty({ description: 'Teléfono de contacto', required: false })
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  telefono?: string;

  @ApiProperty({ description: 'Correo electrónico', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  email?: string;

  @ApiProperty({
    description: 'Dirección física del proveedor',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  direccion?: string;

  @ApiProperty({ description: 'Comuna del proveedor', required: false })
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  comuna?: string;

  @ApiProperty({ description: 'Ciudad del proveedor', required: false })
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  ciudad?: string;

  @ApiProperty({ description: 'Región del proveedor', required: false })
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  region?: string;

  @ApiProperty({ description: 'Giro comercial del proveedor', required: false })
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  giro?: string;
}
