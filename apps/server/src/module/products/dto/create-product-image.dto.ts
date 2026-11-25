// dto/create-product-image.dto.ts
import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateProductImageDto {
    @IsString()
    url: string;

    @IsOptional()
    @IsString()
    altText?: string;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
