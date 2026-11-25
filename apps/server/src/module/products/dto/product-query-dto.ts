import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { BannerType } from 'generated/prisma/enums';
import { QueryDto } from 'src/utils/QueryDto';

export class ProductQueryDto extends QueryDto {


    @IsOptional()
    @IsString()
    collectionSlugs?: string;

    @IsOptional()
    @IsString()
    categorySlugs?: string;

    @IsOptional()
    @IsString()
    subCategorySlugs?: string;

    @IsOptional()
    @IsString()
    brandSlugs?: string;

    @ApiPropertyOptional({ description: 'Filter by publish status' })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isPublish?: boolean;

    @ApiPropertyOptional({ description: 'Minimum price filter' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => value ? Number(value) : undefined)
    minPrice?: number;

    @ApiPropertyOptional({ description: 'Maximum price filter' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => value ? Number(value) : undefined)
    maxPrice?: number;

    @ApiPropertyOptional({ description: 'Sort by price: asc or desc' })
    @IsOptional()
    @IsString()
    sortByPrice?: 'asc' | 'desc';

    @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
    @IsOptional()
    @IsString()
    endDate?: string;
}