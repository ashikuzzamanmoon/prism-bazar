import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/utils/QueryDto';

export class UserQueryDto extends QueryDto {
    @ApiPropertyOptional({ description: 'Filter by active status' })
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
