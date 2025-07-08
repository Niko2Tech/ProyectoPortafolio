import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommunesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.comuna.findMany({
      include: {
        region: true,
      },
    });
  }
}
