import {
    IsString,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsInt,
    IsDateString,
    IsPositive,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromoType } from 'generated/prisma/enums';

export class CreatePromocodeDto {
    @IsString()
    code: string;

    @IsPositive()
    discount: number;

    @IsEnum(PromoType)
    @IsOptional()
    type?: PromoType;

    @IsOptional()
    @IsInt()
    @Min(1)
    usageLimit?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    perUserLimit?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsDateString()
    expiresAt: string;
}