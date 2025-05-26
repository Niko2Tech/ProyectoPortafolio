import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { BrandResponseEntity } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    const brand = await this.prisma.marca.create({
      data: createBrandDto,
    });
    return plainToInstance(BrandResponseEntity, brand);
  }

  async findAll() {
    const brands = await this.prisma.marca.findMany();
    return plainToInstance(BrandResponseEntity, brands);
  }

  async findOne(id: number) {
    try {
      const brand = await this.prisma.marca.findUnique({
        where: { id },
      });

      if (!brand) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }

      return plainToInstance(BrandResponseEntity, brand);
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
      return plainToInstance(BrandResponseEntity, brand);
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
