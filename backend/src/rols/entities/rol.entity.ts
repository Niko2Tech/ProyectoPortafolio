import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RolResponseEntity {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  nombre: string;

  @Expose()
  @ApiProperty()
  descripcion: string;

  constructor(partial: Partial<RolResponseEntity>) {
    Object.assign(this, partial);
  }
}
