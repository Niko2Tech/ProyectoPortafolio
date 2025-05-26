import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { SubcategoriaResponseEntity } from './entities/subcategory.entity';

@Injectable()
export class SubcategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    try {
      const subcategoria = await this.prisma.subcategoriaProducto.create({
        data: createSubcategoryDto,
      });
      return plainToInstance(SubcategoriaResponseEntity, subcategoria);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('ID de la categoria no encontrado');
        } else if (error.code === 'P2002') {
          throw new BadRequestException(
            'Ya existe una subcategoría con el mismo nombre',
          );
        }
      }
      throw error;
    }
  }

  async findAll() {
    const subcategorias = await this.prisma.subcategoriaProducto.findMany({
      include: {
        categoria: true,
      },
    });
    return plainToInstance(SubcategoriaResponseEntity, subcategorias);
  }

  async findOne(id: number) {
    try {
      const subcategoria = await this.prisma.subcategoriaProducto.findUnique({
        where: { id },
        include: { categoria: true },
      });

      if (!subcategoria) {
        throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
      }

      return plainToInstance(SubcategoriaResponseEntity, subcategoria);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al buscar la subcategoría');
    }
  }

  async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    try {
      const subcategoria = await this.prisma.subcategoriaProducto.update({
        where: { id },
        data: updateSubcategoryDto,
      });

      return plainToInstance(SubcategoriaResponseEntity, subcategoria);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Subcategoría con ID ${id} no encontrada`,
          );
        }
      }

      throw new InternalServerErrorException(
        'Error al actualizar la subcategoría',
      );
    }
  }

  async remove(id: number) {
    try {
      const subcategoria = await this.prisma.subcategoriaProducto.delete({
        where: { id },
      });

      return subcategoria;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
      }

      throw new InternalServerErrorException(
        'Error al eliminar la subcategoría',
      );
    }
  }
}
