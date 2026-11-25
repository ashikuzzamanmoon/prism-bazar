import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { DigitalFilesService } from './digital-files.service';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { API_VERSION } from 'src/utils/api-verstion';
import { Response } from 'express';
import * as fs from 'fs';

@ApiTags('Digital Files')
@Controller({
  path: 'digital-files',
  version: API_VERSION.V1,
})
export class DigitalFilesController {
  constructor(private readonly service: DigitalFilesService) {}

  @Post('upload/:productId')
  @ApiOperation({ summary: 'Upload digital PDF file for a product (Admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async uploadFile(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.service.uploadFile(productId, file);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Digital file uploaded successfully',
      data,
    };
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'List digital files metadata for a product' })
  async getByProduct(@Param('productId') productId: string) {
    const data = await this.service.getFilesByProduct(productId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Digital files metadata fetched successfully',
      data,
    };
  }

  @Get('download/:fileId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Download purchased digital file (Authenticated user/admin)' })
  async download(
    @Param('fileId') fileId: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.id || req.user?.userId;
    const roles = req.user?.roles || [];
    const file = await this.service.getDownloadableFile(fileId, userId, roles);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      'Content-Length': file.fileSize,
    });

    const stream = fs.createReadStream(file.filePath);
    return new StreamableFile(stream);
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete digital file (Admin)' })
  async deleteFile(@Param('fileId') fileId: string) {
    const data = await this.service.deleteFile(fileId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Digital file deleted successfully',
      data,
    };
  }
}
