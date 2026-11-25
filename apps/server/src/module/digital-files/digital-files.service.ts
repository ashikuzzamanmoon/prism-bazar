import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DigitalFilesService {
  private readonly storageDir = path.join(process.cwd(), 'uploads', 'digital-files');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async uploadFile(productId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const ext = path.extname(file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const destination = path.join(this.storageDir, uniqueFileName);

    fs.writeFileSync(destination, file.buffer);

    const digitalFile = await this.prisma.digitalFile.create({
      data: {
        productId,
        fileName: file.originalname,
        filePath: destination,
        fileSize: file.size,
        mimeType: file.mimetype || 'application/pdf',
      },
    });

    // Mark product as digital
    await this.prisma.product.update({
      where: { id: productId },
      data: { isDigital: true },
    });

    return digitalFile;
  }

  async getFilesByProduct(productId: string) {
    return this.prisma.digitalFile.findMany({
      where: { productId },
      select: {
        id: true,
        productId: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
      },
    });
  }

  async getDownloadableFile(fileId: string, userId: string, roles: string[] = []) {
    const digitalFile = await this.prisma.digitalFile.findUnique({
      where: { id: fileId },
      include: { product: true },
    });

    if (!digitalFile) {
      throw new NotFoundException('Digital file not found');
    }

    const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
    if (isAdmin) {
      if (!fs.existsSync(digitalFile.filePath)) {
        throw new NotFoundException('File not found on server disk');
      }
      return digitalFile;
    }

    // Check if user has purchased this product and payment is confirmed/success
    const purchased = await this.prisma.orderItem.findFirst({
      where: {
        productId: digitalFile.productId,
        order: {
          userId,
          paymentStatus: {
            in: ['SUCCESS', 'PENDING'],
          },
        },
      },
    });

    if (!purchased) {
      throw new ForbiddenException(
        'You have not purchased this digital product or payment is pending verification.',
      );
    }

    if (!fs.existsSync(digitalFile.filePath)) {
      throw new NotFoundException('File not found on server disk');
    }

    return digitalFile;
  }

  async deleteFile(fileId: string) {
    const file = await this.prisma.digitalFile.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new NotFoundException('Digital file not found');
    }

    if (fs.existsSync(file.filePath)) {
      try {
        fs.unlinkSync(file.filePath);
      } catch (err) {
        console.error('Failed to delete physical file:', err);
      }
    }

    return this.prisma.digitalFile.delete({
      where: { id: fileId },
    });
  }
}
