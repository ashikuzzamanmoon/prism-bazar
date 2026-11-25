import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class FeatureSortItem {
  @ApiProperty({ example: "feature-id-1", description: "Product feature ID" })
  @IsString()
  featureId: string;

  @ApiProperty({ example: 1, description: "Sort order number" })
  @IsNumber()
  sortOrder: number;
}

export class UpdateProductFeatureSortingDto {
  @ApiProperty({
    type: [FeatureSortItem],
    description: "Array of features with their sort order",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureSortItem)
  sortingData: FeatureSortItem[];
}
