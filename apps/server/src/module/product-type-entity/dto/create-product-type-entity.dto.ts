import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateProductTypeEntityDto {
  @ApiProperty({
    example: "অর্গানিক খাদ্য সামগ্রী",
    description: "Unique name of product type entity",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
