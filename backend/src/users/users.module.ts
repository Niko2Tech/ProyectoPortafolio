import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtAuthGuard],
})
export class UsersModule {}
