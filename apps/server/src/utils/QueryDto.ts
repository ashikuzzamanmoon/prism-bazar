import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryDto {
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => +value)
    page: number = 1;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => +value)
    limit: number = 10;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    skipPagination: boolean = false;

    @IsString()
    @IsOptional()
    @Transform(({ value }) => value || '')
    searchTerm: string = '';



    @IsString()
    @IsOptional()
    @Transform(({ value }) => value || 'createdAt')
    sort: string = 'createdAt';

    @IsString()
    @IsOptional()
    @Transform(({ value }) => value || 'desc')
    sortOrder: 'asc' | 'desc' = 'desc';

    @IsOptional()
    @IsString()
    sortBy?: string;
}
