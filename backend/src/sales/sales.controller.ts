import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Ventas')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('procesar-venta')
  async procesarVenta(@Body() procesarVentaDto: CrearVentaDto) {
    return this.salesService.procesarVenta(procesarVentaDto);
  }

  @Get('obtener-venta/:id')
  async obtenerVenta(@Param('id') id: string) {
    return this.salesService.obtenerVenta(id);
  }
}
