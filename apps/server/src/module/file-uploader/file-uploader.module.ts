import { Module } from '@nestjs/common';
import { FileUploaderService } from './file-uploader.service';
import { FileUploaderController } from './file-uploader.controller';
import { ConfigModule } from '@nestjs/config';
import { BucketModule } from 'src/bucket/bucket.modal';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BucketModule,
  ],
  controllers: [FileUploaderController],
  providers: [FileUploaderService],
})
export class FileUploaderModule { }
