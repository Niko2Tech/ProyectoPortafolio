import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardStats {
  cards: {
    productosStockBajo: {
      sinStock: number;
      stockBajo: number;
      productos: Array<{
        id: string;
        nombre: string;
        stockActual: number;
        stockMinimo: number;
      }>;
    };
    ventasHoy: {
      cantidad: number;
      monto: number;
    };
    comprasDelMes: {
      cantidad: number;
      monto: number;
    };
  };
  graficos: {
    ventasPorDia: Array<{
      fecha: string;
      ventas: number;
      cantidad: number;
    }>;
    topProductos: Array<{
      producto: string;
      cantidad: number;
      monto: number;
    }>;
    metodosPageMasUsados: Array<{
      metodo: string;
      cantidad: number;
      monto: number;
    }>;
    comprasPorMes: Array<{
      mes: string;
      cantidad: number;
      monto: number;
    }>;
    movimientosInventario: Array<{
      fecha: string;
      entradas: number;
      salidas: number;
    }>;
  };
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getInformacionGeneral(): Promise<DashboardStats> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // Ejecutar todas las consultas en paralelo
    const [
      productosStockBajo,
      ventasHoy,
      comprasDelMes,
      ventasPorDia,
      topProductos,
      metodosPageMasUsados,
      comprasPorMes,
      movimientosInventario,
    ] = await Promise.all([
      this.getProductosStockBajo(),
      this.getVentasHoy(hoy),
      this.getComprasDelMes(inicioMes, finMes),
      this.getVentasPorDia(),
      this.getTopProductos(),
      this.getMetodosPageMasUsados(),
      this.getComprasPorMes(),
      this.getMovimientosInventario(),
    ]);

    return {
      cards: {
        productosStockBajo,
        ventasHoy,
        comprasDelMes,
      },
      graficos: {
        ventasPorDia,
        topProductos,
        metodosPageMasUsados,
        comprasPorMes,
        movimientosInventario,
      },
    };
  }

  private async getProductosStockBajo() {
    const productos = await this.prisma.producto.findMany({
      where: {
        activo: true,
        OR: [
          { stockActual: 0 },
          { stockActual: { lte: this.prisma.producto.fields.stockMinimo } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        stockActual: true,
        stockMinimo: true,
      },
      orderBy: {
        stockActual: 'asc',
      },
    });

    const sinStock = productos.filter((p) => p.stockActual === 0).length;
    const stockBajo = productos.filter(
      (p) => p.stockActual > 0 && p.stockActual <= p.stockMinimo,
    ).length;

    return {
      sinStock,
      stockBajo,
      productos: productos.slice(0, 10), // Limitar a 10 productos
    };
  }

  private async getVentasHoy(hoy: Date) {
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const ventas = await this.prisma.documentoVenta.aggregate({
      where: {
        fechaEmision: {
          gte: hoy,
          lt: mañana,
        },
        estado: {
          not: 'anulada',
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    });

    return {
      cantidad: ventas._count.id || 0,
      monto: Number(ventas._sum.total) || 0,
    };
  }

  private async getComprasDelMes(inicioMes: Date, finMes: Date) {
    const compras = await this.prisma.compra.aggregate({
      where: {
        fechaEmision: {
          gte: inicioMes,
          lte: finMes,
        },
        estado: {
          not: 'anulada',
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    });

    return {
      cantidad: compras._count.id || 0,
      monto: Number(compras._sum.total) || 0,
    };
  }

  private async getVentasPorDia() {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const ventas = await this.prisma.documentoVenta.groupBy({
      by: ['fechaEmision'],
      where: {
        fechaEmision: {
          gte: hace30Dias,
        },
        estado: {
          not: 'anulada',
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
      orderBy: {
        fechaEmision: 'asc',
      },
    });

    return ventas.map((venta) => ({
      fecha: venta.fechaEmision.toISOString().split('T')[0],
      ventas: Number(venta._sum.total) || 0,
      cantidad: venta._count.id || 0,
    }));
  }

  private async getTopProductos() {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const topProductos = await this.prisma.documentoVentaDetalle.groupBy({
      by: ['productoId'],
      where: {
        documento: {
          fechaEmision: {
            gte: hace30Dias,
          },
          estado: {
            not: 'anulada',
          },
        },
      },
      _sum: {
        cantidad: true,
        totalLinea: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: 10,
    });

    const productosConNombre = await Promise.all(
      topProductos.map(async (item) => {
        const producto = await this.prisma.producto.findUnique({
          where: { id: item.productoId },
          select: { nombre: true },
        });

        return {
          producto: producto?.nombre || 'Producto no encontrado',
          cantidad: Number(item._sum.cantidad) || 0,
          monto: Number(item._sum.totalLinea) || 0,
        };
      }),
    );

    return productosConNombre;
  }

  private async getMetodosPageMasUsados() {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const metodos = await this.prisma.documentoVenta.groupBy({
      by: ['metodoPagoId'],
      where: {
        fechaEmision: {
          gte: hace30Dias,
        },
        estado: {
          not: 'anulada',
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const metodosConNombre = await Promise.all(
      metodos.map(async (item) => {
        const metodo = await this.prisma.metodoPago.findUnique({
          where: { id: item.metodoPagoId },
          select: { nombre: true },
        });

        return {
          metodo: metodo?.nombre || 'Método no encontrado',
          cantidad: item._count.id || 0,
          monto: Number(item._sum.total) || 0,
        };
      }),
    );

    return metodosConNombre;
  }

  private async getComprasPorMes() {
    const hace6Meses = new Date();
    hace6Meses.setMonth(hace6Meses.getMonth() - 6);

    const compras = await this.prisma.compra.findMany({
      where: {
        fechaEmision: {
          gte: hace6Meses,
        },
        estado: {
          not: 'anulada',
        },
      },
      select: {
        fechaEmision: true,
        total: true,
      },
    });

    // Agrupar por mes
    const comprasPorMes = compras.reduce(
      (acc, compra) => {
        const mes = compra.fechaEmision.toISOString().substring(0, 7); // YYYY-MM

        if (!acc[mes]) {
          acc[mes] = { cantidad: 0, monto: 0 };
        }

        acc[mes].cantidad += 1;
        acc[mes].monto += Number(compra.total);

        return acc;
      },
      {} as Record<string, { cantidad: number; monto: number }>,
    );

    return Object.entries(comprasPorMes)
      .map(([mes, datos]) => ({
        mes,
        cantidad: datos.cantidad,
        monto: datos.monto,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  private async getMovimientosInventario() {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const movimientos = await this.prisma.inventarioMovimiento.findMany({
      where: {
        fecha: {
          gte: hace30Dias,
        },
      },
      select: {
        fecha: true,
        tipoMovimiento: true,
        cantidad: true,
      },
    });

    // Agrupar por día
    const movimientosPorDia = movimientos.reduce(
      (acc, mov) => {
        const fecha = mov.fecha.toISOString().split('T')[0];

        if (!acc[fecha]) {
          acc[fecha] = { entradas: 0, salidas: 0 };
        }

        if (mov.tipoMovimiento === 'entrada') {
          acc[fecha].entradas += mov.cantidad;
        } else if (mov.tipoMovimiento === 'salida') {
          acc[fecha].salidas += Math.abs(mov.cantidad);
        }

        return acc;
      },
      {} as Record<string, { entradas: number; salidas: number }>,
    );

    return Object.entries(movimientosPorDia)
      .map(([fecha, datos]) => ({
        fecha,
        entradas: datos.entradas,
        salidas: datos.salidas,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
}
