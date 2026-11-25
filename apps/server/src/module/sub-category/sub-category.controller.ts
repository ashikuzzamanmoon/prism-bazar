import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryQueryDto } from './dto/sub-category-query.dto';
import { API_VERSION } from 'src/utils/api-verstion';

@ApiTags('SubCategory')
@Controller({
  path: "sub-category",
  version: API_VERSION.V1
})
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new sub-category' })
  @ApiBody({ type: CreateSubCategoryDto })
  @ApiResponse({ status: 201, description: 'SubCategory created successfully' })
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    const data = await this.subCategoryService.create(createSubCategoryDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'SubCategory created successfully',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all sub-categories' })
  @ApiResponse({ status: 200, description: 'SubCategories retrieved successfully' })
  async findAll() {
    const data = await this.subCategoryService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategories retrieved successfully',
      data,
    };
  }

  @Get('query')
  @ApiOperation({ summary: 'Get all sub-categories with query filters' })
  @ApiQuery({ name: 'searchTerm', required: false, type: 'string', description: 'Search by sub-category name' })
  @ApiQuery({ name: 'categoryIds', required: false, type: 'string', description: 'Filter by category IDs (comma-separated)' })
  @ApiResponse({ status: 200, description: 'SubCategories retrieved successfully' })
  async findAllQuery(@Query() query: SubCategoryQueryDto) {
    const data = await this.subCategoryService.getAllQuerySubCategory(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategory list fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single sub-category by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'SubCategory ID' })
  @ApiResponse({ status: 200, description: 'SubCategory retrieved successfully' })
  async findOne(@Param('id') id: string) {
    const data = await this.subCategoryService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategory retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sub-category by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'SubCategory ID' })
  @ApiBody({ type: UpdateSubCategoryDto })
  @ApiResponse({ status: 200, description: 'SubCategory updated successfully' })
  async update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    const data = await this.subCategoryService.update(id, updateSubCategoryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategory updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a sub-category by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'SubCategory ID' })
  @ApiResponse({ status: 200, description: 'SubCategory deleted successfully' })
  async remove(@Param('id') id: string) {
    const data = await this.subCategoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategory deleted successfully',
      data,
    };
  }
}
