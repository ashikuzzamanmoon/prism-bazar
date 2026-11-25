import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  number?: number;

  @IsOptional()
  @IsString()
  image?: string;
}
