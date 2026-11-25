import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ProductTypeEntityService } from "./product-type-entity.service";
import { CreateProductTypeEntityDto } from "./dto/create-product-type-entity.dto";
import { UpdateProductTypeEntityDto } from "./dto/update-product-type-entity.dto";
import { API_VERSION } from "src/utils/api-verstion";

@Controller({
  path: "product-type-entity",
  version: API_VERSION.V1,
})
export class ProductTypeEntityController {
  constructor(
    private readonly productTypeEntityService: ProductTypeEntityService,
  ) {}

  @Post()
  async create(@Body() createProductTypeEntityDto: CreateProductTypeEntityDto) {
    const data = await this.productTypeEntityService.create(
      createProductTypeEntityDto,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: "Product type entity created successfully",
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.productTypeEntityService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: "Product type entity list fetched successfully",
      data,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const data = await this.productTypeEntityService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Product type entity fetched successfully",
      data,
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProductTypeEntityDto: UpdateProductTypeEntityDto,
  ) {
    const data = await this.productTypeEntityService.update(
      id,
      updateProductTypeEntityDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: "Product type entity updated successfully",
      data,
    };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    const data = await this.productTypeEntityService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Product type entity deleted successfully",
      data,
    };
  }
}
