import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateProductTypeEntityDto {
  @ApiProperty({
    example: "Gaming Laptop",
    description: "Unique name of product type entity",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
