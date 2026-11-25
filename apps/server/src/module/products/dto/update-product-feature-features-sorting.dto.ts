import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ProductFeatureItem {
  @ApiProperty({ example: 1, description: "Feature item ID in the array" })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: "Processor",
    description: "Feature item key/name",
  })
  @IsString()
  key: string;

  @ApiProperty({
    example: "Intel® Core™ i5-13420H",
    description: "Feature item value",
  })
  @IsString()
  value: string;
}

export class UpdateProductFeatureFeaturesortingDto {
  @ApiProperty({
    type: [ProductFeatureItem],
    description: "Array of feature items with their new order",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFeatureItem)
  sortedFeatures: ProductFeatureItem[];
}
