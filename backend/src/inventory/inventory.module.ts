import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [InventoryService, PrismaService],
})
export class InventoryModule {}
