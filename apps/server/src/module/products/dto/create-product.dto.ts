// dto/create-product.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

import { CreateProductImageDto } from "./create-product-image.dto";
import { CreateProductFeatureDto } from "./create-product-feature.dto";
import { CreateProductInventoryDto } from "./create-product-inventory.dto";
import { ProductCondition, ProductType } from "generated/prisma/enums";
import { FeatureItemDto } from "./feature-item.dto";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  modelNumber: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  brandId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prebookPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryCharge?: number;

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsString()
  typeId?: string;

  @IsOptional()
  @IsBoolean()
  isPublish?: boolean;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  nutritionInfo?: string;

  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  // Relations

  @IsOptional()
  @IsArray()
  collectionIds?: string[];

  @IsOptional()
  @IsArray()
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  subCategoryIds?: string[];

  // Nested

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FeatureItemDto)
  features: FeatureItemDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductFeatureDto)
  productFeatures?: CreateProductFeatureDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductInventoryDto)
  inventory?: CreateProductInventoryDto;

  @IsOptional()
  @IsNumber()
  ratings?: number;

  @IsOptional()
  @IsNumber()
  view?: number;

  @IsOptional()
  @IsNumber()
  reviewsCount?: number;
}
