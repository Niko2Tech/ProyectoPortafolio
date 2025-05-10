import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseEntity {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  nombre: string;

  @Expose()
  @ApiProperty()
  apellido: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  rolId: number;

  @Expose()
  @ApiProperty()
  active: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseEntity>) {
    Object.assign(this, partial);
  }
}
