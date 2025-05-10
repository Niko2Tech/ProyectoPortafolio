import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/utils/bcrypt.util';
import { plainToInstance } from 'class-transformer';
import { UserResponseEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await hashPassword(password);
    const user = await this.prisma.usuario.create({
      data: {
        ...rest,
        password: hashedPassword,
      },
    });
    return plainToInstance(UserResponseEntity, user);
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
    const user = await this.prisma.usuario.delete({ where: { id } });
    return plainToInstance(UserResponseEntity, user);
  }
}
