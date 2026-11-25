import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { AddProductVariantsDto } from './addProductVariantsDto';

export class UpdateProductDto extends PartialType(CreateProductDto) { }

export class UpdateProductVariantsDto extends PartialType(AddProductVariantsDto) { }
