import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { Prisma } from '@prisma/client';
import { CajaAbiertaMovimientoDto } from './dto/caja-abierta-movimiento.dto';
import { QueryCajaUserDto } from './dto/query-caja-user.dto';
import { EstadoCaja } from '@prisma/client';

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
        estado: 'abierta',
      },
      orderBy: { fechaApertura: 'desc' },
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

  async montoTotalCajaActual(id: string) {
    const caja = await this.prisma.caja.findUnique({
      where: { id },
    });

    if (!caja) {
      throw new NotFoundException('Caja no encontrada');
    }

    const montosPorMetodo = await this.prisma.cajaMovimiento.groupBy({
      by: ['metodoPagoId'],
      where: { cajaId: id },
      _sum: { monto: true },
      orderBy: {
        metodoPagoId: 'asc',
      },
    });

    const metodos = await this.prisma.metodoPago.findMany({
      where: {
        id: { in: montosPorMetodo.map((m) => m.metodoPagoId) },
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    const metodoMap = new Map(metodos.map((m) => [m.id, m.nombre]));

    return montosPorMetodo.map((item) => ({
      metodoPagoId: item.metodoPagoId,
      nombre: metodoMap.get(item.metodoPagoId) ?? 'Desconocido',
      monto: item._sum.monto ?? 0,
    }));
  }

  async ultimaCajaMovimientoUsuario(id: string) {
    const caja = await this.prisma.caja.findFirst({
      where: { usuarioId: id },
      orderBy: { fechaApertura: 'desc' },
    });

    if (!caja) {
      throw new NotFoundException('Caja no encontrada');
    }
    return await this.prisma.cajaMovimiento.findMany({
      where: {
        cajaId: caja.id,
      },
      orderBy: { fecha: 'desc' },
      include: {
        metodoPago: {
          select: {
            nombre: true,
          },
        },
      },
    });
  }

  async ultimasCajasUsuario(query: QueryCajaUserDto) {
    const { page = 1, limit = 10, search = '', usuarioId } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const orConditions: Prisma.CajaWhereInput[] = [
      {
        comentario: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        montoCierre: {
          equals: Number(search),
        },
      },
      {
        ...(Object.values(EstadoCaja).includes(search as EstadoCaja)
          ? {
              estado: {
                equals: search as EstadoCaja,
              },
            }
          : {}),
      },
    ];

    const searchAsDate = new Date(search);
    if (!isNaN(searchAsDate.getTime())) {
      orConditions.push(
        { fechaApertura: { equals: searchAsDate } },
        { fechaCierre: { equals: searchAsDate } },
      );
    }

    const where: Prisma.CajaWhereInput = {
      usuarioId,
      ...(search ? { OR: orConditions } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.caja.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: {
          fechaApertura: 'desc',
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          movimientos: {
            select: {
              id: true,
              fecha: true,
              tipoMovimiento: true,

              monto: true,
              metodoPago: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.caja.count({ where }),
    ]);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    };
  }
}
