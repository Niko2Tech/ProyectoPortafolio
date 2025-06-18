import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SupplierResponseEntity {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  razonSocial: string;

  @Expose()
  @ApiProperty({ required: false })
  nombreFantasia?: string;

  @Expose()
  @ApiProperty()
  rut: string;

  @Expose()
  @ApiProperty({ required: false })
  telefono?: string;

  @Expose()
  @ApiProperty({ required: false })
  email?: string;

  @Expose()
  @ApiProperty({ required: false })
  direccion?: string;

  @Expose()
  @ApiProperty({ required: false })
  giro?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<SupplierResponseEntity>) {
    Object.assign(this, partial);
  }
}
