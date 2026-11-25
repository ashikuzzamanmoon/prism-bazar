import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeliveryZonesService } from './delivery-zones.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { API_VERSION } from 'src/utils/api-verstion';

@ApiTags('Delivery Zones')
@Controller({
  path: 'delivery-zones',
  version: API_VERSION.V1,
})
export class DeliveryZonesController {
  constructor(private readonly service: DeliveryZonesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active delivery zones (Public)' })
  async getActive() {
    const data = await this.service.findAllActive();
    return {
      statusCode: HttpStatus.OK,
      message: 'Active delivery zones fetched successfully',
      data,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all delivery zones including inactive (Admin)' })
  async getAll() {
    const data = await this.service.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'All delivery zones fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery zone by ID' })
  async getOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Delivery zone fetched successfully',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create delivery zone (Admin)' })
  async create(@Body() dto: CreateDeliveryZoneDto) {
    const data = await this.service.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Delivery zone created successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delivery zone (Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryZoneDto) {
    const data = await this.service.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Delivery zone updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete delivery zone (Admin)' })
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Delivery zone deleted successfully',
      data,
    };
  }
}
