import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCompraDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { InventoryService } from 'src/inventory/inventory.service';
import { ChangeStatusDto, EstadoCompra } from './dto/update-puchase-state.dto';

@Injectable()
export class PurchaseService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async create(createCompraDto: CreateCompraDto) {
    try {
      // Separar los detalles del DTO principal
      const { detalles, usuarioId, ...compraData } = createCompraDto;

      // Verificar que todos los productos existan
      const productIds = detalles.map((detalle) => detalle.productoId);
      const productos = await this.prisma.producto.findMany({
        where: { id: { in: productIds } },
      });

      if (productos.length !== productIds.length) {
        throw new BadRequestException(
          'Uno o más productos especificados no existen',
        );
      }

      // Crear la compra con sus detalles en una transacción
      const result = await this.prisma.$transaction(async (prisma) => {
        // Crear la compra
        const compra = await prisma.compra.create({
          data: {
            ...compraData,
            fechaEmision: new Date(compraData.fechaEmision),
            fechaRecepcion: compraData.fechaRecepcion
              ? new Date(compraData.fechaRecepcion)
              : null,
          },
        });

        // Crear los detalles de la compra
        await Promise.all(
          detalles.map((detalle) =>
            prisma.compraDetalle.create({
              data: {
                compraId: compra.id,
                productoId: detalle.productoId,
                cantidad: detalle.cantidad,
                costoUnitario: detalle.costoUnitario,
                totalLinea: detalle.totalLinea,
              },
            }),
          ),
        );

        // Si el estado es 'recibida', actualizar el inventario
        if (compra.estado === EstadoCompra.RECIBIDA) {
          await Promise.all(
            detalles.map((detalle) =>
              this.inventoryService.registrarMovimiento({
                productoId: detalle.productoId,
                tipoMovimiento: 'entrada',
                cantidad: detalle.cantidad,
                usuarioId: usuarioId,
                comentario: `Compra recibida - Documento: ${compra.tipoDocumento.toUpperCase()} ${compra.numeroDocumento}`,
              }),
            ),
          );
        }

        return compra;
      });

      // Obtener la compra completa con todas las relaciones
      const compraCompleta = await this.prisma.compra.findUnique({
        where: { id: result.id },
        include: {
          proveedor: {
            select: {
              id: true,
              nombreFantasia: true,
              razonSocial: true,
              rut: true,
            },
          },
          detalles: {
            include: {
              producto: {
                select: {
                  id: true,
                  sku: true,
                  nombre: true,
                  unidadMedida: true,
                },
              },
            },
          },
        },
      });

      return compraCompleta;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Violación de constraint único (proveedor + tipo + número)
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Ya existe una compra con ese proveedor, tipo y número de documento',
          );
        }
        // FK no encontrada (proveedorId)
        if (error.code === 'P2003') {
          throw new BadRequestException('El proveedor especificado no existe');
        }
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear la compra');
    }
  }

  async findAll(query: PurchaseQueryDto) {
    const {
      page = 1,
      limit = 10,
      search = '',
      estado,
      tipoDocumento,
      fechaInicio,
      fechaFin,
      proveedorId,
    } = query;
    const skip = (page - 1) * limit;

    const orConditions: Prisma.CompraWhereInput[] = [];

    if (search) {
      orConditions.push(
        {
          numeroDocumento: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          proveedor: {
            nombreFantasia: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        {
          proveedor: {
            razonSocial: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        {
          proveedor: {
            rut: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      );

      // Agregar condición por monto total si el valor es numérico
      const searchAsNumber = Number(search);
      if (!isNaN(searchAsNumber)) {
        orConditions.push({ total: { equals: searchAsNumber } });
      }
    }

    const where: Prisma.CompraWhereInput = {
      ...(search && orConditions.length > 0 ? { OR: orConditions } : {}),
      ...(estado && { estado }),
      ...(tipoDocumento && { tipoDocumento }),
      ...(proveedorId && { proveedorId }),
      ...(fechaInicio && {
        fechaEmision: {
          gte: new Date(fechaInicio),
        },
      }),
      ...(fechaFin && {
        fechaEmision: {
          lte: new Date(fechaFin),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.compra.findMany({
        where,
        skip,
        take: limit,
        include: {
          proveedor: {
            select: {
              id: true,
              nombreFantasia: true,
              razonSocial: true,
              rut: true,
            },
          },
          detalles: {
            select: {
              id: true,
              cantidad: true,
              costoUnitario: true,
              totalLinea: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.compra.count({ where }),
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
      const compra = await this.prisma.compra.findUnique({
        where: { id },
        include: {
          proveedor: {
            select: {
              id: true,
              nombreFantasia: true,
              razonSocial: true,
              rut: true,
              email: true,
              telefono: true,
            },
          },
          detalles: {
            include: {
              producto: {
                select: {
                  id: true,
                  sku: true,
                  nombre: true,
                  unidadMedida: true,
                },
              },
            },
          },
        },
      });

      if (!compra) {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }

      return compra;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar la compra');
    }
  }

  async update(id: string, updateCompraDto: UpdatePurchaseDto) {
    try {
      const compra = await this.prisma.compra.update({
        where: { id },
        data: {
          ...updateCompraDto,
          ...(updateCompraDto.fechaEmision && {
            fechaEmision: new Date(updateCompraDto.fechaEmision),
          }),
          ...(updateCompraDto.fechaRecepcion && {
            fechaRecepcion: new Date(updateCompraDto.fechaRecepcion),
          }),
        },
        include: {
          proveedor: {
            select: {
              id: true,
              nombreFantasia: true,
              razonSocial: true,
              rut: true,
            },
          },
        },
      });

      return compra;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Violación de constraint único
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Ya existe una compra con ese proveedor, tipo y número de documento',
          );
        }
        // FK no encontrada
        if (error.code === 'P2003') {
          throw new BadRequestException('El proveedor especificado no existe');
        }
      }

      throw new InternalServerErrorException('Error al actualizar la compra');
    }
  }

  async remove(id: string) {
    try {
      const compra = await this.prisma.compra.delete({
        where: { id },
        include: {
          proveedor: {
            select: {
              nombreFantasia: true,
            },
          },
        },
      });

      return compra;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }

      throw new InternalServerErrorException('Error al eliminar la compra');
    }
  }

  async getResumenCompras() {
    const [
      totalCompras,
      totalProveedores,
      totalMontoComprasAgg,
      comprasPendientes,
      comprasRecibidas,
      comprasUltimos30DiasAgg,
    ]: [
      number,
      number,
      { _sum: { total: Prisma.Decimal | null } },
      number,
      number,
      { _sum: { total: Prisma.Decimal | null } },
    ] = await this.prisma.$transaction([
      this.prisma.compra.count(),
      this.prisma.proveedor.count(),
      this.prisma.compra.aggregate({
        _sum: { total: true },
      }),
      this.prisma.compra.count({
        where: { estado: 'pendiente' },
      }),
      this.prisma.compra.count({
        where: { estado: 'recibida' },
      }),
      this.prisma.compra.aggregate({
        _sum: { total: true },
        where: {
          fechaEmision: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 días
          },
        },
      }),
    ]);

    const totalMontoCompras = Number(totalMontoComprasAgg._sum.total ?? 0);
    const comprasUltimos30Dias = Number(
      comprasUltimos30DiasAgg._sum.total ?? 0,
    );

    return {
      totalCompras,
      totalProveedores,
      totalMontoCompras,
      comprasPendientes,
      comprasRecibidas,
      comprasUltimos30Dias,
    };
  }

  async findByProveedor(proveedorId: string) {
    try {
      const compras = await this.prisma.compra.findMany({
        where: { proveedorId },
        include: {
          proveedor: {
            select: {
              nombreFantasia: true,
              razonSocial: true,
            },
          },
        },
        orderBy: {
          fechaEmision: 'desc',
        },
      });

      return compras;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al buscar compras por proveedor',
      );
    }
  }

  async cambiarEstado(id: string, changeStatusDto: ChangeStatusDto) {
    try {
      const { estado: nuevoEstado, usuarioId } = changeStatusDto;

      const compraActual = await this.prisma.compra.findUnique({
        where: { id },
        include: {
          detalles: true,
        },
      });

      if (!compraActual) {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }

      const result = await this.prisma.$transaction(async (prisma) => {
        const compra = await prisma.compra.update({
          where: { id },
          data: { estado: nuevoEstado },
          include: {
            proveedor: {
              select: {
                nombreFantasia: true,
              },
            },
          },
        });

        // Si el estado cambió a 'recibida' y antes no lo era, actualizar inventario
        if (
          nuevoEstado === EstadoCompra.RECIBIDA &&
          compraActual.estado !== EstadoCompra.RECIBIDA &&
          usuarioId
        ) {
          await Promise.all(
            compraActual.detalles.map((detalle) =>
              this.inventoryService.registrarMovimiento({
                productoId: detalle.productoId,
                tipoMovimiento: 'entrada',
                cantidad: Number(detalle.cantidad),
                usuarioId: usuarioId,
                comentario: `Compra recibida - Documento: ${compra.tipoDocumento.toUpperCase()} ${compra.numeroDocumento}`,
              }),
            ),
          );
        }

        return compra;
      });

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Compra con ID ${id} no encontrada`);
      }

      throw new InternalServerErrorException('Error al cambiar el estado');
    }
  }
}
