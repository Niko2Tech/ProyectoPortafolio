import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { InventoryQueryDto } from './dto/query-inventory.dto';

@ApiTags('Inventory')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: '' })
  @Get()
  async getInventory(@Query() query: InventoryQueryDto) {
    return this.inventoryService.getInventory(query);
  }
}
