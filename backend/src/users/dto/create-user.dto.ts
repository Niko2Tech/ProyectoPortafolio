import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre del usuario' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  apellido: string;

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ description: 'ID del rol asignado al usuario' })
  @IsNotEmpty({ message: 'El ID del rol es obligatorio' })
  @IsInt({ message: 'El ID del rol debe ser un numero entero' })
  rolId: number;

  @ApiProperty({ description: 'Estado activo del usuario', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
