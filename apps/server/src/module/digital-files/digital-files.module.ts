import { Module } from '@nestjs/common';
import { DigitalFilesService } from './digital-files.service';
import { DigitalFilesController } from './digital-files.controller';

@Module({
  controllers: [DigitalFilesController],
  providers: [DigitalFilesService],
  exports: [DigitalFilesService],
})
export class DigitalFilesModule {}
