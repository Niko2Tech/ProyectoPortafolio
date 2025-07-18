import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoMovimientoInventario } from '@prisma/client';
import { InventoryQueryDto } from './dto/query-inventory.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async registrarMovimiento(params: {
    productoId: string;
    tipoMovimiento: TipoMovimientoInventario;
    cantidad: number;
    usuarioId: string;
    comentario?: string;
  }) {
    const { productoId, tipoMovimiento, cantidad, usuarioId, comentario } =
      params;

    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new BadRequestException('Producto no encontrado');
    }

    const stockAnterior = producto.stockActual;
    let stockNuevo: number;

    switch (tipoMovimiento) {
      case 'entrada':
      case 'devolucion':
        stockNuevo = stockAnterior + cantidad;
        break;
      case 'salida':
      case 'ajuste':
        stockNuevo = stockAnterior - cantidad;
        break;
      default:
        throw new BadRequestException('Tipo de movimiento inválido');
    }

    if (stockNuevo < 0) {
      throw new BadRequestException(
        `El stock no puede ser negativo (stock resultante: ${stockNuevo})`,
      );
    }

    // Actualiza el stock del producto
    await this.prisma.producto.update({
      where: { id: productoId },
      data: {
        stockActual: stockNuevo,
      },
    });

    // Crea el movimiento de inventario
    return this.prisma.inventarioMovimiento.create({
      data: {
        productoId,
        tipoMovimiento,
        cantidad,
        stockAnterior,
        stockNuevo,
        usuarioId,
        comentario,
        fecha: new Date(),
      },
    });
  }

  async getInventory(query: InventoryQueryDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const orConditions: Prisma.InventarioMovimientoWhereInput[] = [
      {
        producto: {
          nombre: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
      },
      {
        producto: {
          sku: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
      },
      {
        producto: {
          codigoBarras: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      },
      {
        comentario: { contains: search, mode: Prisma.QueryMode.insensitive },
      },
    ];

    const searchAsNumber = Number(search);
    if (!isNaN(searchAsNumber)) {
      orConditions.push({ cantidad: { equals: searchAsNumber } });
    }

    const where: Prisma.InventarioMovimientoWhereInput = search
      ? { OR: orConditions }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventarioMovimiento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fecha: 'desc' },
        include: {
          producto: true,
          usuario: true,
        },
      }),
      this.prisma.inventarioMovimiento.count({ where }),
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
}
