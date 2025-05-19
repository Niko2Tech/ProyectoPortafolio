import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty()
  token?: string;

  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Nicolás Jiménez' })
  nombre: string;

  @ApiProperty({ example: 'nico@example.com' })
  email: string;

  @ApiProperty({ example: 1 })
  rolId: number;

  @ApiProperty({ example: 'Usuario' })
  rolName: string;

  @Exclude()
  password: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
