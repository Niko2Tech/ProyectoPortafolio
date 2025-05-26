import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { CategoryResponseEntity } from '../../categories/entities/category.entity';

@Exclude()
export class SubcategoriaResponseEntity {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  categoriaId: number;

  @Expose()
  @ApiProperty()
  nombre: string;

  @Expose()
  @ApiProperty({ required: false })
  descripcion?: string;

  @Expose()
  @ApiProperty({ type: () => CategoryResponseEntity })
  @Type(() => CategoryResponseEntity)
  categoria?: CategoryResponseEntity;

  constructor(partial: Partial<SubcategoriaResponseEntity>) {
    Object.assign(this, partial);
  }
}
