import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const producto = await this.prisma.producto.create({
        data: createProductDto,
      });

      return producto;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // SKU único
        if (error.code === 'P2002') {
          throw new BadRequestException('Ya existe un producto con ese SKU');
        }
        // FK no encontrada
        if (error.code === 'P2003') {
          throw new BadRequestException('Alguna de las relaciones no existe');
        }
      }
      throw new InternalServerErrorException('Error al crear el producto');
    }
  }

  async findAll() {
    const productos = await this.prisma.producto.findMany();
    return productos;
  }

  async findOne(id: string) {
    try {
      const producto = await this.prisma.producto.findUnique({
        where: { id },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      return producto;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar el producto');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const producto = await this.prisma.producto.update({
        where: { id },
        data: updateProductDto,
      });

      return producto;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      throw new InternalServerErrorException('Error al actualizar el producto');
    }
  }

  async remove(id: string) {
    try {
      const producto = await this.prisma.producto.delete({
        where: { id },
      });

      return producto;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      throw new InternalServerErrorException('Error al eliminar el producto');
    }
  }
}
