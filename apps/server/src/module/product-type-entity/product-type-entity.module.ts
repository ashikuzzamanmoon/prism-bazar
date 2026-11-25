import { Module } from '@nestjs/common';
import { ProductTypeEntityService } from './product-type-entity.service';
import { ProductTypeEntityController } from './product-type-entity.controller';

@Module({
  controllers: [ProductTypeEntityController],
  providers: [ProductTypeEntityService],
})
export class ProductTypeEntityModule {}
