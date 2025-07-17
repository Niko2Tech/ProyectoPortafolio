import { PartialType } from '@nestjs/swagger';
import { CreatePayMethodDto } from './create-pay-method.dto';

export class UpdatePayMethodDto extends PartialType(CreatePayMethodDto) {}
