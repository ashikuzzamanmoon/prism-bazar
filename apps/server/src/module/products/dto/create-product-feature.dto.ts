// dto/create-product-feature.dto.ts
import {
    IsOptional,
    IsString,
    IsEnum,
    IsArray,
    ValidateNested,
    IsInt,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeatureItemDto } from './feature-item.dto';
import { FeatureType } from 'generated/prisma/enums';

export class CreateProductFeatureDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsEnum(FeatureType)
    type: FeatureType;

    @IsInt()
    @Min(0)
    sortOrder: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FeatureItemDto)
    features: FeatureItemDto[];
}
