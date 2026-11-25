import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from 'src/utils/QueryDto';

export class RelevantProductQueryDto extends QueryDto {
    @ApiPropertyOptional({ description: 'Collection IDs (comma-separated)' })
    @IsOptional()
    @IsString()
    collectionIds?: string;

    @ApiPropertyOptional({ description: 'Category IDs (comma-separated)' })
    @IsOptional()
    @IsString()
    categoryIds?: string;
}
