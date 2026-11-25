import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class UpdateProductColorStockDto {
  @ApiProperty({
    example: "cmmjb28p9000qazjqv4jew92t",
    description: "Product color ID",
  })
  @IsString()
  colorId: string;

  @ApiProperty({ example: 20, description: "Stock for the color" })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;
}

export class UpdateProductPriceDto {
  @ApiProperty({
    example: 999,
    description: "Current selling price",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    example: 10,
    description: "Total inventory quantity",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  inventoryQuantity?: number;

  @ApiProperty({
    type: [UpdateProductColorStockDto],
    required: false,
    description: "Color-wise stock updates",
    example: [{ colorId: "cmmjb28p9000qazjqv4jew92t", stock: 15 }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductColorStockDto)
  colorStocks?: UpdateProductColorStockDto[];
}