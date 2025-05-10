import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RolsService } from './rols.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

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
  async findOne(@Param('id') id: string) {
    return await this.rolsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRolDto: UpdateRolDto) {
    return await this.rolsService.update(+id, updateRolDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.rolsService.remove(+id);
  }
}
