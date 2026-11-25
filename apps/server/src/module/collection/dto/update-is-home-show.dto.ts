import { IsBoolean, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateIsHomeShowDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  isHomeShow: boolean;
}
