

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NoLeadingSlashOrDot } from 'src/utils/sanitizePath';

export class CreateFileUploaderDto {
    @IsOptional()
    @IsArray()
    images?: string[];

    @IsNotEmpty()
    @IsString()
    @NoLeadingSlashOrDot({ message: 'filePath should not start with ./ or /' })
    filePath?: string;
}
