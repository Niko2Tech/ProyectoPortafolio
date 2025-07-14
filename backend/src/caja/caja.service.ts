import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { Prisma } from '@prisma/client';
import { CajaAbiertaMovimientoDto } from './dto/caja-abierta-movimiento.dto';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  async abrirCaja(abrirCajaDto: AbrirCajaDto) {
    return await this.prisma.caja.create({
      data: {
        fechaApertura: new Date(),
        montoApertura: abrirCajaDto.montoApertura,
        usuarioId: abrirCajaDto.usuarioId,
      },
    });
  }

  async buscarCajaAbierta(id: string) {
    const caja = await this.prisma.caja.findFirst({
      where: {
        usuarioId: id,
      },
    });

    if (!caja) {
      throw new NotFoundException('Caja no encontrada');
    }

    return caja;
  }

  async cerrarCaja(cerrarCajaDto: CerrarCajaDto) {
    try {
      return await this.prisma.caja.update({
        where: { id: cerrarCajaDto.id },
        data: {
          fechaCierre: new Date(),
          ...cerrarCajaDto,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Caja con ese ID no encontrada');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Usuario no encontrado');
        }
      }
      throw error;
    }
  }

  async movimientosCaja(cajaAbiertaMovimientoDto: CajaAbiertaMovimientoDto) {
    return await this.prisma.cajaMovimiento.create({
      data: {
        ...cajaAbiertaMovimientoDto,
        fecha: new Date(),
      },
    });
  }
}
