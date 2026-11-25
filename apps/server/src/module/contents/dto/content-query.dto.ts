import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { QueryDto } from "src/utils/QueryDto";

export class ContentQueryDto extends QueryDto {
  @ApiPropertyOptional({ description: "Start date filter (ISO string)" })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: "End date filter (ISO string)" })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: "Minimum content number" })
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  minNumber?: number;

  @ApiPropertyOptional({ description: "Maximum content number" })
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  maxNumber?: number;
}
