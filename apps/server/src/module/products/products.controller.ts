import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import {
  UpdateProductDto,
  UpdateProductVariantsDto,
} from "./dto/update-product.dto";
import { API_VERSION } from "src/utils/api-verstion";
import { AddProductVariantsDto } from "./dto/addProductVariantsDto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { ProductQueryDto } from "./dto/product-query-dto";
import { RelevantProductQueryDto } from "./dto/relevant-product-query.dto";
import { UpdateProductPriceDto } from "./dto/update-product-price.dto";
import { UpdateProductFeatureSortingDto } from "./dto/update-product-feature-sorting.dto";
import { UpdateProductMainFeaturesSortingDto } from "./dto/update-product-main-features-sorting.dto";
import { UpdateProductFeatureFeaturesortingDto } from "./dto/update-product-feature-features-sorting.dto";
import { ProductType } from "generated/prisma/enums";

@ApiTags("Products")
@Controller({
  path: "products",
  version: API_VERSION.V1,
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Create new product" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post("variants")
  @ApiOperation({ summary: "Add product variants" })
  @ApiResponse({ status: 201, description: "Variants added successfully" })
  addProductVariants(@Body() payload: AddProductVariantsDto) {
    return this.productsService.createProductVariants(payload);
  }

  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: 200, description: "Products fetched successfully" })
  getAllProducts(@Query() query: ProductQueryDto) {
    return this.productsService.getAllProducts(query);
  }

  @Get("relevant/by-collection-category")
  @ApiOperation({
    summary: "Get relevant products by collection and category IDs",
  })
  @ApiQuery({
    name: "collectionIds",
    required: false,
    description: "Comma-separated collection IDs",
  })
  @ApiQuery({
    name: "categoryIds",
    required: false,
    description: "Comma-separated category IDs",
  })
  @ApiResponse({
    status: 200,
    description: "Relevant products fetched successfully",
  })
  getRelevantProducts(@Query() query: RelevantProductQueryDto) {
    return this.productsService.getRelevantProducts(query);
  }

  @Get("query")
  @ApiOperation({ summary: "Get all products with query filter" })
  @ApiQuery({ name: "searchTerm", required: false })
  @ApiQuery({ name: "categoryId", required: false })
  @ApiResponse({
    status: 200,
    description: "Filtered products fetched successfully",
  })
  getAllProductsQuery() {
    return this.productsService.getAllQueryProducts();
  }
  
  @Get("inventory")
  @ApiOperation({ summary: "Get product inventory" })
  @ApiResponse({ status: 200, description: "Product inventory fetched successfully" })
  async getProductInventory (){
    return this.productsService.getProductInventory();
  }

  @Get("new-arrival-product")
  @ApiOperation({ summary: "Get new arrival products by product type" })
  @ApiQuery({
    name: "productType",
    required: false,
    enum: ProductType,
    description: "Product type filter",
  })
  @ApiResponse({
    status: 200,
    description: "New arrival products fetched successfully",
  })
  getNewArrivalProduct(
    @Query("productType") productType?: ProductType,
  ) {
    return this.productsService.getNewArriveProduct();
  }

  @Get("pre-owned-product")
  getPreOwnedProduct() {
    return this.productsService.getPreOwnedProduct();
  }


  @Get("top-product")
  @ApiOperation({ summary: "Get top products" })
  @ApiResponse({ status: 200, description: "Top products fetched successfully" })
  getTopProduct() {
    return this.productsService.getTopProduct();
  }

  @Get("accessories-product")
  @ApiOperation({ summary: "Get accessories products with limit 20" })
  @ApiResponse({
    status: 200,
    description: "Accessories products fetched successfully",
  })
  getAccessoriesProduct() {
    return this.productsService.getAccessoriesProduct();
  }



  @Get(":identifier")
  @ApiOperation({ summary: "Get product by id or slug" })
  @ApiParam({ name: "identifier", description: "Product ID or Slug" })
  @ApiResponse({ status: 200, description: "Product fetched successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async getProduct(@Param("identifier") identifier: string) {
    const product = await this.productsService.getProductByIdOrSlug(identifier);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  @Get("edit/:id")
  async getProductById(@Param("id") id: string) {
    const product = await this.productsService.getProductForEdit(id);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  @Get("variants-edit/:id")
  async getProductVariantsForEdit(@Param("id") id: string) {
    const variants = await this.productsService.getProductVariantsForEdit(id);
    if (!variants) throw new NotFoundException("Product not found");
    return variants;
  }

  @Get("features-sorting/:id")
  async singleProductMainFeatureSorting(@Param("id") id: string) {
    const products =
      await this.productsService.singleProductMainFeatureSorting(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Product features sorted successfully",
      data: products,
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  updateProduct(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch("variants-update/:id")
  @ApiOperation({ summary: "Update product variants" })
  @ApiParam({ name: "id", description: "Variant ID" })
  @ApiResponse({
    status: 200,
    description: "Product variants updated successfully",
  })
  updateProductVariants(
    @Param("id") id: string,
    @Body() payload: UpdateProductVariantsDto,
  ) {
    return this.productsService.updateProductVariants(id, payload);
  }

  @Patch("publish/:id")
  @ApiOperation({ summary: "Publish or unpublish product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiQuery({
    name: "publish",
    required: true,
    type: "boolean",
    description: "Set to true to publish, false to unpublish",
  })
  @ApiResponse({
    status: 200,
    description: "Product publish status updated successfully",
  })
  async publishProduct(
    @Param("id") id: string,
    @Query("publish") publish: boolean,
  ) {
    return this.productsService.getProductPublishUnPublish(id, publish);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  async remove(@Param("id") id: string) {
    const result = await this.productsService.deleteProduct(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Product deleted successfully!",
      data: result,
    };
  }

  @Patch(":id/inventory")
  @ApiOperation({ summary: "Update product price and stock" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Product price and stock updated successfully",
  })
  async updateProductInventory(
    @Param("id") id: string,
    @Body() dto: UpdateProductPriceDto,
  ) {
    const result = await this.productsService.updateProductInventory(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: "Product price and stock updated successfully",
      data: result,
    };
  }

  // ============ Sorting Services Controllers ============

  /**
   * Service 1: Get all ProductFeatures by ProductId with sorting
   */
  @Get(":productId/product-features")
  @ApiOperation({
    summary:
      "Get all product features by product ID sorted by sortOrder",
  })
  @ApiParam({ name: "productId", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Product features fetched successfully",
  })
  async getAllProductFeaturesByProductId(
    @Param("productId") productId: string,
  ) {
    const result =
      await this.productsService.getAllProductFeaturesByProductId(productId);
    return {
      statusCode: HttpStatus.OK,
      message: "Product features fetched successfully",
      data: result,
    };
  }

  /**
   * Service 2: Update ProductFeature sorting by sortOrder
   */
  @Patch(":productId/features-sorting")
  @ApiOperation({
    summary: "Update product feature sorting by sortOrder",
  })
  @ApiParam({ name: "productId", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Product features sorted successfully",
  })
  async updateProductFeatureSorting(
    @Param("productId") productId: string,
    @Body() dto: UpdateProductFeatureSortingDto,
  ) {
    const result = await this.productsService.updateProductFeatureSorting(
      productId,
      dto.sortingData,
    );
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }

  /**
   * Service 3: Update main Product features (JSON) sorting
   */
  @Patch(":productId/main-features-sorting")
  @ApiOperation({
    summary: "Update main product features (JSON) sorting",
  })
  @ApiParam({ name: "productId", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Product main features sorted successfully",
  })
  async updateProductMainFeatureSorting(
    @Param("productId") productId: string,
    @Body() dto: UpdateProductMainFeaturesSortingDto,
  ) {
    const result = await this.productsService.updateProductMainFeatureSorting(
      productId,
      dto.sortedFeatures,
    );
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.data,
    };
  }

  /**
   * Service 4: Get ProductFeature by ID with features JSON
   */
  @Get("feature/:featureId")
  @ApiOperation({
    summary: "Get ProductFeature by ID with its features JSON array",
  })
  @ApiParam({ name: "featureId", description: "ProductFeature ID" })
  @ApiResponse({
    status: 200,
    description: "ProductFeature fetched successfully",
  })
  async getProductFeatureById(@Param("featureId") featureId: string) {
    const result = await this.productsService.getProductFeatureById(featureId);
    return {
      statusCode: HttpStatus.OK,
      message: "ProductFeature fetched successfully",
      data: result,
    };
  }

  /**
   * Service 5: Update ProductFeature's features (JSON) sorting
   */
  @Patch("feature/:featureId/features-sorting")
  @ApiOperation({
    summary: "Update ProductFeature's features JSON array sorting",
  })
  @ApiParam({ name: "featureId", description: "ProductFeature ID" })
  @ApiResponse({
    status: 200,
    description: "ProductFeature features sorted successfully",
  })
  async updateProductFeatureFeaturesSorting(
    @Param("featureId") featureId: string,
    @Body() dto: UpdateProductFeatureFeaturesortingDto,
  ) {
    const result =
      await this.productsService.updateProductFeatureFeaturesSorting(
        featureId,
        dto.sortedFeatures,
      );
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.data,
    };
  }
}
