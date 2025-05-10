import { Module } from '@nestjs/common';
import { RolsService } from './rols.service';
import { RolsController } from './rols.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RolsController],
  providers: [RolsService, PrismaService],
})
export class RolsModule {}
