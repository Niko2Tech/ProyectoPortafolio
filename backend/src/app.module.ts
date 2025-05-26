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
export class AppModule {}
