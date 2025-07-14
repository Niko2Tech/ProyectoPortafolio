import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CajaService } from '../caja/caja.service';
import { InventoryService } from '../inventory/inventory.service';
import { CrearVentaDetalleDto, CrearVentaDto } from './dto/crear-venta.dto';
import { Prisma } from '@prisma/client';
import { CajaAbiertaMovimientoDto } from 'src/caja/dto/caja-abierta-movimiento.dto';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private cajaService: CajaService,
    private inventoryService: InventoryService,
  ) {}

  async procesarVenta(ventaDto: CrearVentaDto) {
    return await this.prisma.$transaction(async (prisma) => {
      const { detalles, ...ventaData } = ventaDto;

      // 1. Verificar que existe una caja abierta
      const cajaAbierta = await this.cajaService.buscarCajaAbierta(
        ventaData.usuarioId,
      );

      if (!cajaAbierta) {
        throw new NotFoundException('No hay una caja abierta para el usuario');
      }

      // 2. Validar stock disponible para todos los productos
      await this.validarStockDisponible(detalles, prisma);

      // 3. Crear el documento de venta
      const documentoVenta = await prisma.documentoVenta.create({
        data: ventaData,
      });

      // 4. Crear los detalles de la venta en batch
      await prisma.documentoVentaDetalle.createMany({
        data: detalles.map((detalle) => ({
          ...detalle,
          documentoId: documentoVenta.id,
        })),
      });

      // 5. Registrar movimiento de caja (INGRESO - entra dinero)
      const cajaMovimientoDto: CajaAbiertaMovimientoDto = {
        cajaId: cajaAbierta.id,
        tipoMovimiento: 'ingreso', // Corregido: venta = ingreso de dinero
        monto: ventaData.total,
        metodoPagoId: ventaData.metodoPagoId,
        documentoId: documentoVenta.id,
        tipoDocumento: ventaData.tipoDocumento,
        usuarioId: ventaData.usuarioId,
      };

      await this.cajaService.movimientosCaja(cajaMovimientoDto);

      // 6. Registrar movimientos de inventario
      await Promise.all(
        detalles.map((detalle) =>
          this.inventoryService.registrarMovimiento({
            productoId: detalle.productoId,
            tipoMovimiento: 'salida',
            cantidad: detalle.cantidad,
            usuarioId: ventaData.usuarioId,
            comentario: `Venta - Documento ${documentoVenta.numeroDocumento}`,
          }),
        ),
      );

      // 7. Retornar el documento con sus detalles
      return await prisma.documentoVenta.findUnique({
        where: { id: documentoVenta.id },
        include: {
          detalles: {
            include: {
              producto: true,
            },
          },
          cliente: true,
          metodoPago: true,
          usuario: true,
        },
      });
    });
  }

  private async validarStockDisponible(
    detalles: CrearVentaDetalleDto[],
    prisma: Prisma.TransactionClient,
  ) {
    // Obtener todos los productos de una vez
    const productosIds = detalles.map((d) => d.productoId);
    const productos = await prisma.producto.findMany({
      where: { id: { in: productosIds } },
      select: { id: true, stockActual: true, nombre: true },
    });

    // Validar cada producto
    for (const detalle of detalles) {
      const producto = productos.find((p) => p.id === detalle.productoId);

      if (!producto) {
        throw new BadRequestException(
          `Producto con ID ${detalle.productoId} no encontrado`,
        );
      }

      if (producto.stockActual < detalle.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${producto.nombre}. ` +
            `Disponible: ${producto.stockActual}, Solicitado: ${detalle.cantidad}`,
        );
      }
    }
  }

  async obtenerVenta(id: string) {
    const venta = await this.prisma.documentoVenta.findUnique({
      where: { id },
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
        cliente: true,
        metodoPago: true,
        usuario: true,
      },
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    return venta;
  }

  async anularVenta(id: string, usuarioId: string) {
    return await this.prisma.$transaction(async (prisma) => {
      const venta = await prisma.documentoVenta.findUnique({
        where: { id },
        include: { detalles: true },
      });

      if (!venta) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (venta.estado === 'anulada') {
        throw new BadRequestException('La venta ya está anulada');
      }

      // Actualizar estado a anulada
      await prisma.documentoVenta.update({
        where: { id },
        data: { estado: 'anulada' },
      });

      // Revertir movimientos de inventario
      await Promise.all(
        venta.detalles.map((detalle) =>
          this.inventoryService.registrarMovimiento({
            productoId: detalle.productoId,
            tipoMovimiento: 'devolucion',
            cantidad: Number(detalle.cantidad),
            usuarioId,
            comentario: `Anulación de venta - Documento ${venta.numeroDocumento}`,
          }),
        ),
      );

      return { message: 'Venta anulada correctamente' };
    });
  }
}
