import { IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class QueryCajaUserDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => String)
  search?: string;

  @Type(() => String)
  @IsUUID()
  usuarioId: string;
}
