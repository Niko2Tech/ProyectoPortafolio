import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PayMethodService } from './pay-method.service';
import { CreatePayMethodDto } from './dto/create-pay-method.dto';
import { UpdatePayMethodDto } from './dto/update-pay-method.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Métodos de pago')
@Controller('pay-method')
export class PayMethodController {
  constructor(private readonly payMethodService: PayMethodService) {}

  @Post()
  create(@Body() createPayMethodDto: CreatePayMethodDto) {
    return this.payMethodService.create(createPayMethodDto);
  }

  @Get()
  findAll() {
    return this.payMethodService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payMethodService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePayMethodDto: UpdatePayMethodDto,
  ) {
    return this.payMethodService.update(+id, updatePayMethodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payMethodService.remove(+id);
  }
}
