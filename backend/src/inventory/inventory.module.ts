import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InventoryController } from './inventory.controller';

@Module({
  providers: [InventoryService, PrismaService],
  controllers: [InventoryController],
})
export class InventoryModule {}
