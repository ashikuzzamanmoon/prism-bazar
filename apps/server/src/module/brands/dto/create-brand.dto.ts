import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class CreateBrandDto {
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Project name is required" })
  title: string;

  @IsOptional()
  @IsString({ message: "Slug must be a string" })
  slug?: string;

  @IsString({ message: "Image must be a string URL or path" })
  @IsNotEmpty({ message: "Project image is required" })
  image: string;

  @IsBoolean()
  @IsOptional()
  isPublish?: boolean = false;
}

export class BrandOrderItem {
  @IsString()
  id: string;

  @IsNumber()
  order: number;
}

export class UpdateBrandOrderingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrandOrderItem)
  orders: BrandOrderItem[];
}
