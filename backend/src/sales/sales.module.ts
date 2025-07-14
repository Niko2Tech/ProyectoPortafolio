import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CajaService } from 'src/caja/caja.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@Module({
  controllers: [SalesController],
  providers: [
    SalesService,
    PrismaService,
    CajaService,
    InventoryService,
    JwtAuthGuard,
  ],
})
export class SalesModule {}
