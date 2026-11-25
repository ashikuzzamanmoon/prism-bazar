import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsDateString,
} from 'class-validator';
import { PromoType } from 'generated/prisma/enums';
import { QueryDto } from 'src/utils/QueryDto';

export class PromoQueryDto extends QueryDto {
    @ApiPropertyOptional({
        enum: PromoType,
        description: 'Filter by promo type',
    })
    @IsOptional()
    @IsEnum(PromoType)
    type?: PromoType;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Start date filter (ISO format)',
        example: '2026-02-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'End date filter (ISO format)',
        example: '2026-02-28T23:59:59.000Z',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}