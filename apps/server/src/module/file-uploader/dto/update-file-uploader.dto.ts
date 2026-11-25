import { PartialType } from '@nestjs/swagger';
import { CreateFileUploaderDto } from './create-file-uploader.dto';

export class UpdateFileUploaderDto extends PartialType(CreateFileUploaderDto) {}
