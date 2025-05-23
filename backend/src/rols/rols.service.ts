import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Rol } from './entities/rol.entity';
import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRolDto: CreateRolDto) {
    const rol = await this.prisma.rol.create({ data: createRolDto });
    return plainToInstance(Rol, rol);
  }

  async findAll() {
    const roles = await this.prisma.rol.findMany();
    return plainToInstance(Rol, roles);
  }

  async findOne(id: number) {
    try {
      const rol = await this.prisma.rol.findUnique({ where: { id } });
      return plainToInstance(Rol, rol);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Rol con ID ${id} no encontrado`);
        }
      }
      throw error;
    }
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    try {
      const rol = await this.prisma.rol.update({
        where: { id },
        data: updateRolDto,
      });
      return plainToInstance(Rol, rol);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Rol con ID ${id} no encontrado`);
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const rol = await this.prisma.rol.delete({ where: { id } });
      return plainToInstance(Rol, rol);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Rol con ID ${id} no encontrado`);
        }
      }
      throw error;
    }
  }
}
