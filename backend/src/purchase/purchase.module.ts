import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { InventoryService } from 'src/inventory/inventory.service';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, PrismaService, JwtAuthGuard, InventoryService],
})
export class PurchaseModule {}
