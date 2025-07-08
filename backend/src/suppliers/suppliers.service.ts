import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { SupplierResponseEntity } from './entities/supplier.entity';
import { SupplierQueryDto } from './dto/supplier-query.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    try {
      const proveedor = await this.prisma.proveedor.create({
        data: createSupplierDto,
      });
      return plainToInstance(SupplierResponseEntity, proveedor);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Ya existe un proveedor con ese RUT');
        }
      }
      throw new InternalServerErrorException('Error al crear el proveedor');
    }
  }

  async findAll(query: SupplierQueryDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const orConditions: Prisma.ProveedorWhereInput[] = [
      { razonSocial: { contains: search, mode: Prisma.QueryMode.insensitive } },
      {
        nombreFantasia: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      { rut: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { telefono: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { direccion: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { giro: { contains: search, mode: Prisma.QueryMode.insensitive } },
    ];

    const where: Prisma.ProveedorWhereInput = search
      ? { OR: orConditions }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.proveedor.findMany({
        where,
        skip,
        take: limit,
        include: {
          comuna: {
            include: {
              region: true,
            },
          },
        },
      }),
      this.prisma.proveedor.count({ where }),
    ]);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string) {
    try {
      const proveedor = await this.prisma.proveedor.findUnique({
        include: {
          comuna: {
            include: {
              region: true,
            },
          },
        },
        where: { id },
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }

      return proveedor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el proveedor');
    }
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    try {
      const proveedor = await this.prisma.proveedor.update({
        where: { id },
        data: updateSupplierDto,
      });
      return plainToInstance(SupplierResponseEntity, proveedor);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }
      throw new InternalServerErrorException(
        'Error al actualizar el proveedor',
      );
    }
  }

  async remove(id: string) {
    try {
      const proveedor = await this.prisma.proveedor.delete({
        where: { id },
      });
      return proveedor;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
      }

      throw new InternalServerErrorException('Error al eliminar el proveedor');
    }
  }
}
