import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSubCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    categoryIds?: string[];
}
