import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { CreateCompraDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { ChangeStatusDto } from './dto/update-puchase-state.dto';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@ApiTags('Compras')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva compra' })
  @ApiResponse({ status: 201, description: 'Compra creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.purchaseService.create(createCompraDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las compras con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras obtenida exitosamente',
  })
  findAll(@Query() query: PurchaseQueryDto) {
    return this.purchaseService.findAll(query);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Obtener resumen de compras' })
  @ApiResponse({ status: 200, description: 'Resumen obtenido exitosamente' })
  getResumen() {
    return this.purchaseService.getResumenCompras();
  }

  @Get('proveedor/:proveedorId')
  @ApiOperation({ summary: 'Obtener compras por proveedor' })
  @ApiResponse({
    status: 200,
    description: 'Compras del proveedor obtenidas exitosamente',
  })
  findByProveedor(@Param('proveedorId', ParseUUIDPipe) proveedorId: string) {
    return this.purchaseService.findByProveedor(proveedorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una compra por ID' })
  @ApiResponse({ status: 200, description: 'Compra obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una compra' })
  @ApiResponse({ status: 200, description: 'Compra actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar estado de una compra' })
  @ApiResponse({ status: 200, description: 'Estado cambiado exitosamente' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return this.purchaseService.cambiarEstado(id, changeStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una compra' })
  @ApiResponse({ status: 200, description: 'Compra eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseService.remove(id);
  }
}
