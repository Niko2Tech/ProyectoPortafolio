import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePayMethodDto } from './dto/create-pay-method.dto';
import { UpdatePayMethodDto } from './dto/update-pay-method.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PayMethodService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPayMethodDto: CreatePayMethodDto) {
    return this.prisma.metodoPago.create({
      data: createPayMethodDto,
    });
  }

  findAll() {
    return this.prisma.metodoPago.findMany();
  }

  async findOne(id: number) {
    const payMethod = await this.prisma.metodoPago.findUnique({
      where: { id },
    });
    if (!payMethod) {
      throw new NotFoundException('El método de pago no existe');
    }
    return payMethod;
  }

  async update(id: number, updatePayMethodDto: UpdatePayMethodDto) {
    try {
      const updatedPayMethod = await this.prisma.metodoPago.update({
        where: { id },
        data: updatePayMethodDto,
      });
      return updatedPayMethod;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('El método de pago ya existe');
        } else if (error.code === 'P2025') {
          throw new BadRequestException('El método de pago no existe');
        }
      }
      throw new BadRequestException(error);
    }
  }

  async remove(id: number) {
    try {
      const deletedPayMethod = await this.prisma.metodoPago.delete({
        where: { id },
      });
      return deletedPayMethod;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('El método de pago no existe');
        }
      }
      throw new BadRequestException(error);
    }
  }
}
