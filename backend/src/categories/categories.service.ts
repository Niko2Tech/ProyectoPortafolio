import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.categoriaProducto.create({
      data: createCategoryDto,
    });
    return plainToInstance(CategoryResponseEntity, category);
  }

  async findAll() {
    const categories = await this.prisma.categoriaProducto.findMany();
    return plainToInstance(CategoryResponseEntity, categories);
  }

  async findOne(id: number) {
    try {
      const category = await this.prisma.categoriaProducto.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Categoria con ID ${id} no encontrado`);
      }

      return plainToInstance(CategoryResponseEntity, category);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Error en la base de datos');
      }

      throw error;
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.categoriaProducto.update({
        where: { id },
        data: updateCategoryDto,
      });
      return plainToInstance(CategoryResponseEntity, category);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Categoria con ID ${id} no encontrado`);
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const category = await this.prisma.categoriaProducto.delete({
        where: { id },
      });
      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Categoria con ID ${id} no encontrado`);
        }
      }
      throw error;
    }
  }
}
