import { Controller, Post, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileUploaderService } from './file-uploader.service';
import { CreateFileUploaderDto } from './dto/create-file-uploader.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { API_VERSION } from 'src/utils/api-verstion';
import { IUploadedMulterFile } from 'src/bucket';


@Controller({
  path: "file-uploader",
  version: API_VERSION.V1,
})
export class FileUploaderController {
  constructor(private readonly fileUploaderService: FileUploaderService) { }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async create(
    @Body() dto: CreateFileUploaderDto,
    @UploadedFiles() files: { images?: IUploadedMulterFile[] },
  ): Promise<string[]> {

    return this.fileUploaderService.create(dto, files);
  }
}
