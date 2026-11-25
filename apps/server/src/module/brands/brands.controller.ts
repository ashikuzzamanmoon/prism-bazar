import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query, Put } from '@nestjs/common';
import { CreateBrandDto, UpdateBrandOrderingDto } from './dto/create-brand.dto';
import { API_VERSION } from 'src/utils/api-verstion';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandsService } from './brands.service';
import { BrandQueryDto } from './dto/brand-query-dto';


@Controller(
  {
    path: "brand",
    version: API_VERSION.V1,
  }
)
export class BrandsController {
  constructor(private readonly brandService: BrandsService) { }

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    const result = await this.brandService.create(createBrandDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Create successfully",
      data: result
    }
  }

  @Get()
  async findAll(@Query() query: BrandQueryDto) {
    const result = await this.brandService.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: "Brand retrieve successfully!",
      data: result
    }
  }
  @Get("query")
  async findAllQuery() {
    const result = await this.brandService.getAllQueryBrand();
    return {
      statusCode: HttpStatus.OK,
      message: "Brand retrieve successfully!",
      data: result
    }
  }

  @Get("all")
  async getAllBrand() {
    const result = await this.brandService.findAllBrand();
    return {
      statusCode: HttpStatus.OK,
      message: "Get Successfully",
      data: result
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.brandService.findOne(id);
    return result
  }



  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    const result = await this.brandService.updateBrand(id, updateBrandDto);
    return {
      statusCode: HttpStatus.OK,
      message: "Brand order updated successfully!",
      data: result
    }
  }


  @Put('ordering')
  async updateBrandOrder(@Body() updateOrder: any) {
    const result = await this.brandService.updateBrandOrdering(updateOrder);
    return {
      statusCode: HttpStatus.OK,
      message: "Update Successfully!",
      data: result
    }

  }



  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.brandService.deleteBrand(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Delete successfully!",
      data: result
    }
  }
}
