import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ProductQueryDto } from './dto/product-query.dto.ts';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const producto = await this.prisma.producto.create({
        data: createProductDto,
      });

      return producto;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // SKU único
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Ya existe un producto con ese SKU o código de barras',
          );
        }
        // FK no encontrada
        if (error.code === 'P2003') {
          throw new BadRequestException('Alguna de las relaciones no existe');
        }
      }
      throw new InternalServerErrorException('Error al crear el producto');
    }
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (page - 1) * limit;

    const orConditions: Prisma.ProductoWhereInput[] = [
      { nombre: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
      {
        codigoBarras: { contains: search, mode: Prisma.QueryMode.insensitive },
      },
      {
        marca: {
          nombre: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
      },
      {
        categoria: {
          nombre: { contains: search, mode: Prisma.QueryMode.insensitive },
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
    ];

    // Agrega la condición por precio solo si el valor es numérico
    const searchAsNumber = Number(search);
    if (!isNaN(searchAsNumber)) {
      orConditions.push({ precioVenta: { equals: searchAsNumber } });
    }

    const where: Prisma.ProductoWhereInput = search ? { OR: orConditions } : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limit,
        include: {
          marca: true,
          categoria: true,
          subcategoria: true,
          proveedor: true,
        },
      }),
      this.prisma.producto.count({ where }),
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
      const producto = await this.prisma.producto.findUnique({
        where: { id },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      return producto;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar el producto');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const producto = await this.prisma.producto.update({
        where: { id },
        data: updateProductDto,
      });

      return producto;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      throw new InternalServerErrorException('Error al actualizar el producto');
    }
  }

  async remove(id: string) {
    try {
      const producto = await this.prisma.producto.delete({
        where: { id },
      });

      return producto;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      throw new InternalServerErrorException('Error al eliminar el producto');
    }
  }

  async getResumenInventario() {
    const [
      numCategorias,
      totalProductos,
      totalValorProductosAgg,
      ultimasVentas,
      costoVentasAgg,
      productosSinStock,
    ]: [
      number,
      number,
      { _sum: { precioVenta: Prisma.Decimal | null } },
      number,
      { _sum: { total: Prisma.Decimal | null } },
      number,
    ] = await this.prisma.$transaction([
      this.prisma.categoriaProducto.count(),
      this.prisma.producto.count(),
      this.prisma.producto.aggregate({
        _sum: { precioVenta: true },
      }),
      this.prisma.documentoVenta.count({
        where: {
          fechaEmision: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // últimos 7 días
          },
        },
      }),
      this.prisma.documentoVenta.aggregate({
        _sum: { total: true },
        where: {
          fechaEmision: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.producto.count({
        where: {
          stockActual: 0,
        },
      }),
    ]);

    const [productosBajoStockRow] = await this.prisma.$queryRaw<
      { count: number }[]
    >`
      SELECT COUNT(*)::int AS count
      FROM "producto"
      WHERE "stock_actual" < "stock_minimo"
    `;
    const productosBajoStock = productosBajoStockRow?.count ?? 0;

    const totalValorProductos = Number(
      totalValorProductosAgg._sum.precioVenta ?? 0,
    );
    const costoVentas = Number(costoVentasAgg._sum.total ?? 0);

    return {
      numCategorias,
      totalProductos,
      totalValorProductos,
      ultimasVentas,
      costoVentas,
      productosBajoStock,
      productosSinStock,
    };
  }

  async findAllProducts() {
    const productos = await this.prisma.producto.findMany();
    return productos;
  }
}
