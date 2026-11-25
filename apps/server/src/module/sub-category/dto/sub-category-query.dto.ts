import { IsOptional, IsString } from 'class-validator';

export class SubCategoryQueryDto {
    @IsOptional()
    @IsString()
    searchTerm?: string;

    @IsOptional()
    @IsString()
    categoryIds?: string;
}
