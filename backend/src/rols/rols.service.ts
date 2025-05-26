import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolResponseEntity } from './entities/rol.entity';
import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRolDto: CreateRolDto) {
    const rol = await this.prisma.rol.create({ data: createRolDto });
    return plainToInstance(RolResponseEntity, rol);
  }

  async findAll() {
    const roles = await this.prisma.rol.findMany();
    return plainToInstance(RolResponseEntity, roles);
  }

  async findOne(id: number) {
    try {
      const rol = await this.prisma.rol.findUnique({ where: { id } });

      if (!rol) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      return plainToInstance(RolResponseEntity, rol);
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

  async update(id: number, updateRolDto: UpdateRolDto) {
    try {
      const rol = await this.prisma.rol.update({
        where: { id },
        data: updateRolDto,
      });
      return plainToInstance(RolResponseEntity, rol);
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
      return rol;
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
