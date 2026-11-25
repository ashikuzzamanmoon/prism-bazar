import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Men',
        description: 'Category name',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'men',
        description: 'Unique category slug',
    })
    @IsString()
    slug: string;

    @ApiPropertyOptional({
        example: ['collectionId1', 'collectionId2'],
        description: 'Optional collection IDs',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    collectionIds?: string[];
}
