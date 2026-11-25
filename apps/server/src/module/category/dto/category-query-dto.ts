
import { IsOptional, IsString } from 'class-validator';

export class CategoryAllQueryDto {
    @IsOptional()
    @IsString()
    searchTerm?: string;

    @IsOptional()
    @IsString()
    collectionIds?: string; // comma separated: "id1,id2,id3"
}