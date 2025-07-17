import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { ApiCookieAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { QueryCajaUserDto } from './dto/query-caja-user.dto';

@ApiTags('Caja')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('abrir-caja')
  async abrirCaja(@Body() abrirCajaDto: AbrirCajaDto) {
    return this.cajaService.abrirCaja(abrirCajaDto);
  }

  @Get('buscar-caja-abierta-usuario/:id')
  async buscarCajaAbierta(@Param('id', ParseUUIDPipe) id: string) {
    return this.cajaService.buscarCajaAbierta(id);
  }

  @Post('cerrar-caja')
  async cerrarCaja(@Body() cerrarCajaDto: CerrarCajaDto) {
    return this.cajaService.cerrarCaja(cerrarCajaDto);
  }

  @Get('monto-total-caja-actual/:id')
  async MontoTotalCajaActual(@Param('id', ParseUUIDPipe) id: string) {
    return this.cajaService.montoTotalCajaActual(id);
  }

  @Get('ultima-caja-movimiento-usuario/:id')
  async ultimaCajaMovimientoUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return this.cajaService.ultimaCajaMovimientoUsuario(id);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: '' })
  @ApiQuery({ name: 'usuarioId', required: true, type: String, example: '' })
  @Get('ultimas-cajas-usuario')
  async ultimasCajasUsuario(@Query() query: QueryCajaUserDto) {
    return this.cajaService.ultimasCajasUsuario(query);
  }
}
