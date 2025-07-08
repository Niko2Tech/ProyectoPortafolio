import { Controller, Get } from '@nestjs/common';
import { CommunesService } from './communes.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@ApiTags('Comunas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('communes')
export class CommunesController {
  constructor(private readonly communesService: CommunesService) {}

  @Get()
  findAll() {
    return this.communesService.findAll();
  }
}
