import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Rol {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  nombre: string;

  @Expose()
  @ApiProperty()
  descripcion: string;

  constructor(partial: Partial<Rol>) {
    Object.assign(this, partial);
  }
}
