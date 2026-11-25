// dto/feature-item.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class FeatureItemDto {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    value: string;
}
