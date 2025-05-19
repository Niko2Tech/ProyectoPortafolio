import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/utils/bcrypt.util';
import { plainToInstance } from 'class-transformer';
import { UserResponseEntity } from './entities/user.entity';
import { Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const rol = await this.prisma.rol.findUnique({
      where: { id: createUserDto.rolId },
    });
    if (!rol) {
      throw new BadRequestException(
        `El rol con ID ${createUserDto.rolId} no existe`,
      );
    }
    const hashedPassword = await hashPassword(password);
    try {
      const user = await this.prisma.usuario.create({
        data: {
          ...rest,
          password: hashedPassword,
        },
      });
      return plainToInstance(UserResponseEntity, user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email ya registrado');
        }
      }
      throw error;
    }
  }

  async findAll() {
    const users = await this.prisma.usuario.findMany();
    return plainToInstance(UserResponseEntity, users);
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    return plainToInstance(UserResponseEntity, user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const { password, ...rest } = updateUserDto;
      const hashedPassword = await hashPassword(password);
      const user = await this.prisma.usuario.update({
        where: { id },
        data: {
          ...rest,
          password: hashedPassword,
        },
      });
      return plainToInstance(UserResponseEntity, user);
    }
    const user = await this.prisma.usuario.update({
      where: { id },
      data: updateUserDto,
    });
    return plainToInstance(UserResponseEntity, user);
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.usuario.delete({ where: { id } });
      return plainToInstance(UserResponseEntity, user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Usuario no encontrado');
        }
      }
      throw error;
    }
  }
}
