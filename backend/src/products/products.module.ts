import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, JwtAuthGuard],
})
export class ProductsModule {}
