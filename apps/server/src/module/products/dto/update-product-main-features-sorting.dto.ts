import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class MainFeatureItem {
  @ApiProperty({ example: 1, description: "Feature ID in the array" })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: "Processor",
    description: "Feature key/name",
  })
  @IsString()
  key: string;

  @ApiProperty({
    example: "Intel® Core™ i5-13420H",
    description: "Feature value",
  })
  @IsString()
  value: string;
}

export class UpdateProductMainFeaturesSortingDto {
  @ApiProperty({
    type: [MainFeatureItem],
    description: "Array of main features with their new order",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MainFeatureItem)
  sortedFeatures: MainFeatureItem[];
}
