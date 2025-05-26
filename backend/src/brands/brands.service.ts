import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    const brand = await this.prisma.marca.create({
      data: createBrandDto,
    });
    return brand;
  }

  async findAll() {
    return this.prisma.marca.findMany();
  }

  async findOne(id: number) {
    try {
      const brand = await this.prisma.marca.findUnique({
        where: { id },
      });

      if (!brand) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }

      return brand;
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

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    try {
      const brand = await this.prisma.marca.update({
        where: { id },
        data: updateBrandDto,
      });
      return brand;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const brand = await this.prisma.marca.delete({
        where: { id },
      });
      return brand;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }
      throw error;
    }
  }
}
