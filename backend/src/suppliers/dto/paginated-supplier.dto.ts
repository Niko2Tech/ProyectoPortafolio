import { ApiProperty } from '@nestjs/swagger';
import { SupplierResponseEntity } from '../entities/supplier.entity';
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

export class PaginatedSupplierDto {
  @ApiProperty({ type: [SupplierResponseEntity] })
  @Type(() => SupplierResponseEntity)
  data: SupplierResponseEntity[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}
