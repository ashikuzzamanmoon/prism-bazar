import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { API_VERSION } from 'src/utils/api-verstion';
import { CategoryAllQueryDto } from './dto/category-query-dto';

@ApiTags('Categories')
@Controller({
  path: "categories",
  version: API_VERSION.V1
})
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  async create(@Body() dto: CreateCategoryDto) {
    console.log('collection from req', dto)
    const data = await this.categoryService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Category created successfully',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    const data = await this.categoryService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Category list fetched successfully',
      data,
    };
  }

  @Get("query")
  @ApiOperation({ summary: 'Get all categories with query' })
  async findAllQuery(@Query() query: CategoryAllQueryDto) {
    const data = await this.categoryService.getAllQueryCategory(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category list fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single category' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoryService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.categoryService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category (soft)' })
  async remove(@Param('id') id: string) {
    const data = await this.categoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category deleted successfully',
      data,
    };
  }
}
