import { Injectable } from '@nestjs/common';
import { CreateFileUploaderDto } from './dto/create-file-uploader.dto';
import { BucketService } from 'src/bucket/bucket.service';
import { IUploadedMulterFile } from 'src/bucket';


@Injectable()

export class FileUploaderService {
  constructor(private readonly bucket: BucketService) { }

  async create(
    dto: CreateFileUploaderDto,
    files: {
      images?: IUploadedMulterFile[];
    },
  ) {
    let images: string[] = [];
    if (files && files.images) {
      images = await Promise.all(
        files.images.map(async (x) => {
          const url = await this.bucket.upload(x, `${dto.filePath}/`);
          return (url as string).toString();
        }),
      );
    }

    return images;
  }

}
