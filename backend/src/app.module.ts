import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolsModule } from './rols/rols.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { BrandsModule } from './brands/brands.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { LoggerMiddleware } from './logger.middleware';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    RolsModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    SubcategoriesModule,
    BrandsModule,
    SuppliersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Todas las rutas
  }
}
