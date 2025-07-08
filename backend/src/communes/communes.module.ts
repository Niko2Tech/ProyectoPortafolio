import { Module } from '@nestjs/common';
import { CommunesService } from './communes.service';
import { CommunesController } from './communes.controller';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CommunesController],
  providers: [CommunesService, PrismaService, JwtAuthGuard],
})
export class CommunesModule {}
