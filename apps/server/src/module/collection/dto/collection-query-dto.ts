import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { BannerType } from 'generated/prisma/enums';
import { QueryDto } from 'src/utils/QueryDto';

export class CollectionQueryDto extends QueryDto {
    @ApiPropertyOptional({ enum: BannerType, description: 'Filter by banner type' })
    @ApiPropertyOptional({ description: 'Filter by active status', default: true })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;



    @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
    @IsOptional()
    @IsString()
    endDate?: string;
}