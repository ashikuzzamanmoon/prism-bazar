import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { API_VERSION } from 'src/utils/api-verstion';
import { PromoQueryDto } from './dto/promo-query-dto';

@Controller({
  path: 'promocode',
  version: API_VERSION.V1,
})
export class PromocodeController {
  constructor(private readonly promocodeService: PromocodeService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPromocodeDto: CreatePromocodeDto) {
    const result = await this.promocodeService.create(createPromocodeDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Promo code created successfully',
      data: result,
    };
  }

  @Post("apply")
  async applyPromoCode(@Body() payload: { code: string }) {
    const result = await this.promocodeService.applyPromoCode(
      payload.code
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Promo code applied successfully',
      data: result,
    };
  }


  @Get()
  async findAll(@Query() query: PromoQueryDto) {
    const result = await this.promocodeService.findAll(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Promo codes fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.promocodeService.findOne(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Promo code fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePromocodeDto: UpdatePromocodeDto,
  ) {
    const result = await this.promocodeService.update(id, updatePromocodeDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Promo code updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.promocodeService.remove(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Promo code deleted successfully',
    };
  }
}