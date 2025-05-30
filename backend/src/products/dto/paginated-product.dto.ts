import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from '../entities/product.entity'; // Este lo defines tú según tu estructura
import { Type } from 'class-transformer';

class PaginationMeta {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;
}

export class PaginatedProductDto {
  @ApiProperty({ type: [ProductEntity] })
  @Type(() => ProductEntity)
  data: ProductEntity[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}
