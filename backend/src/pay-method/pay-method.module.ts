import { Module } from '@nestjs/common';
import { PayMethodService } from './pay-method.service';
import { PayMethodController } from './pay-method.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PayMethodController],
  providers: [PayMethodService, PrismaService],
})
export class PayMethodModule {}
