// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper para limpiar la base de datos en entornos de prueba
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // Añade aquí las tablas que quieres limpiar durante pruebas
    // en el orden correcto para evitar errores de clave foránea
    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations');

    for (const table of tables) {
      await this.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${table}" CASCADE;`,
      );
    }
  }
}
