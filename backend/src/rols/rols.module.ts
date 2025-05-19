import { Module } from '@nestjs/common';
import { RolsService } from './rols.service';
import { RolsController } from './rols.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@Module({
  controllers: [RolsController],
  providers: [RolsService, PrismaService, JwtAuthGuard],
})
export class RolsModule {}
