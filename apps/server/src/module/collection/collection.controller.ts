import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { CollectionService } from "./collection.service";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { API_VERSION } from "src/utils/api-verstion";
import { CollectionQueryDto } from "./dto/collection-query-dto";
import { UpdateIsHomeShowDto } from "./dto/update-is-home-show.dto";

@ApiTags("Collections")
@Controller({
  path: "collections",
  version: API_VERSION.V1,
})
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @ApiOperation({ summary: "Create a new collection" })
  @ApiResponse({ status: 201, description: "Collection created successfully" })
  @ApiResponse({ status: 400, description: "Invalid data" })
  async create(@Body() dto: CreateCollectionDto) {
    const collection = await this.collectionService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Collection created successfully",
      data: collection,
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all collections" })
  @ApiResponse({
    status: 200,
    description: "Collections retrieved successfully",
  })
  async findAll(@Query() query: CollectionQueryDto) {
    const collections = await this.collectionService.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: "Collections retrieved successfully",
      data: collections,
    };
  }
  @Get("query")
  @ApiOperation({ summary: "Get all collections with query" })
  @ApiResponse({
    status: 200,
    description: "Collections retrieved successfully",
  })
  async findAllQuery() {
    const collections = await this.collectionService.getAllQueryCollection();
    return {
      statusCode: HttpStatus.OK,
      message: "Collections retrieved successfully",
      data: collections,
    };
  }

  @Get("all")
  @ApiOperation({ summary: "Get all collections" })
  @ApiResponse({
    status: 200,
    description: "Collections retrieved successfully",
  })
  async findAllForLanding() {
    const collections = await this.collectionService.findAllForLanding();
    return {
      statusCode: HttpStatus.OK,
      message: "Collections retrieved successfully",
      data: collections,
    };
  }

  @Get("products")
  @ApiOperation({
    summary: "Get all collections with product count and products",
  })
  @ApiResponse({
    status: 200,
    description: "Collections with products retrieved successfully",
  })
  async getCollectionProducts() {
    const collections = await this.collectionService.getCollectionProducts();
    return {
      statusCode: HttpStatus.OK,
      message: "Collections with products retrieved successfully",
      data: collections,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a collection by ID" })
  @ApiResponse({
    status: 200,
    description: "Collection retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Collection not found" })
  async findOne(@Param("id") id: string) {
    const collection = await this.collectionService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Collection retrieved successfully",
      data: collection,
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a collection by ID" })
  @ApiResponse({ status: 200, description: "Collection updated successfully" })
  @ApiResponse({ status: 404, description: "Collection not found" })
  async update(@Param("id") id: string, @Body() dto: UpdateCollectionDto) {
    const collection = await this.collectionService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: "Collection updated successfully",
      data: collection,
    };
  }

  @Patch(":id/home-show")
  @ApiOperation({ summary: "Update isHomeShow status of a collection" })
  @ApiResponse({
    status: 200,
    description: "Collection isHomeShow status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Collection not found" })
  async updateIsHomeShow(
    @Param("id") id: string,
    @Body() dto: UpdateIsHomeShowDto,
  ) {
    const collection = await this.collectionService.updateIsHomeShow(
      id,
      dto.isHomeShow,
    );
    return {
      statusCode: HttpStatus.OK,
      message: "Collection isHomeShow status updated successfully",
      data: collection,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a collection by ID" })
  @ApiResponse({ status: 200, description: "Collection deleted successfully" })
  @ApiResponse({ status: 404, description: "Collection not found" })
  async remove(@Param("id") id: string) {
    const collection = await this.collectionService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Collection deleted successfully",
      data: collection,
    };
  }
}
