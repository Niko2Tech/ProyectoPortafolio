import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { UseGuards } from '@nestjs/common';

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
}
