import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RolsService } from './rols.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';

@ApiTags('Roles')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('rols')
export class RolsController {
  constructor(private readonly rolsService: RolsService) {}

  @Post()
  async create(@Body() createRolDto: CreateRolDto) {
    return await this.rolsService.create(createRolDto);
  }

  @Get()
  async findAll() {
    return await this.rolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.rolsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return await this.rolsService.update(id, updateRolDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.rolsService.remove(id);
  }
}
