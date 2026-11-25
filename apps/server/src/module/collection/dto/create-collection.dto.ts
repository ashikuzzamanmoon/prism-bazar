import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCollectionDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isHomeShow?: boolean;
}
