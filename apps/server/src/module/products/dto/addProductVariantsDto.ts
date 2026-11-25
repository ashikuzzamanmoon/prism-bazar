// add-product-variants.dto.ts
import { IsArray, IsDecimal, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProductImageDto {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsOptional()
    altText?: string;

    @IsOptional()
    isPrimary?: boolean;

    @IsOptional()
    sortOrder?: number;
}

class ProductColorDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    hexCode?: string;

    @IsInt()
    stock: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    basePrice: number;

    @IsOptional()
    isPublish?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductImageDto)
    images: ProductImageDto[];
}

class ProductOptionValueDto {
    @IsString()
    @IsNotEmpty()
    value: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    extraPrice: number;

    @IsOptional()
    isPublish?: boolean;
}

class ProductOptionGroupDto {
    @IsString()
    @IsNotEmpty()
    title: string; // RAM, STORAGE, KEYBOARD

    @IsString()
    type: 'RAM' | 'STORAGE' | 'KEYBOARD';

    @IsOptional()
    isPublish?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductOptionValueDto)
    options: ProductOptionValueDto[];
}

export class AddProductVariantsDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductColorDto)
    colors?: ProductColorDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductOptionGroupDto)
    options?: ProductOptionGroupDto[];
}
