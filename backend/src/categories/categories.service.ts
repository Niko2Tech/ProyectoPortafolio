import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.categoriaProducto.create({
      data: createCategoryDto,
    });
    return category;
  }

  async findAll() {
    const categories = await this.prisma.categoriaProducto.findMany();
    return categories;
  }

  async findOne(id: number) {
    try {
      const category = await this.prisma.categoriaProducto.findUnique({
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

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.categoriaProducto.update({
        where: { id },
        data: updateCategoryDto,
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
