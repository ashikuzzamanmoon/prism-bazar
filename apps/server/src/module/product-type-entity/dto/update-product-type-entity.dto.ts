import { PartialType } from '@nestjs/swagger';
import { CreateProductTypeEntityDto } from './create-product-type-entity.dto';

export class UpdateProductTypeEntityDto extends PartialType(CreateProductTypeEntityDto) {}
