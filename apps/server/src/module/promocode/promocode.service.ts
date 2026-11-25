import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { PrismaService } from 'src/prisma/prisma';
import { PromoQueryDto } from './dto/promo-query-dto';
import { Prisma } from 'generated/prisma/client';
import { pagination } from 'src/utils/pagination';

@Injectable()
export class PromocodeService {
  private readonly logger = new Logger(PromocodeService.name);

  constructor(private readonly prisma: PrismaService) { }

  async create(createPromocodeDto: CreatePromocodeDto) {
    const existing = await this.prisma.promoCode.findUnique({
      where: { code: createPromocodeDto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('Promo code already exists');
    }

    if (new Date(createPromocodeDto.expiresAt) <= new Date()) {
      throw new BadRequestException('Expiry date must be future date');
    }

    return this.prisma.promoCode.create({
      data: {
        code: createPromocodeDto.code.toUpperCase(),
        discount: createPromocodeDto.discount,
        type: createPromocodeDto.type,
        usageLimit: createPromocodeDto.usageLimit,
        perUserLimit: createPromocodeDto.perUserLimit,
        expiresAt: new Date(createPromocodeDto.expiresAt),
        isActive: createPromocodeDto.isActive ?? true,
      },
    });
  }

  async findAll(query: PromoQueryDto) {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      type,
      isActive,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.PromoCodeWhereInput = {
      isDeleted: false,
      ...(type ? { type } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
      ...(searchTerm
        ? {
          OR: [
            { code: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }
        : {}),
      ...(startDate || endDate
        ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promoCode.count({ where }),
    ]);
    return pagination(data, total, page, limit);


  }

  async findOne(id: string) {
    const promo = await this.prisma.promoCode.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!promo) {
      throw new NotFoundException('Promo code not found');
    }

    return promo;
  }

  async update(id: string, updatePromocodeDto: UpdatePromocodeDto) {
    await this.findOne(id);

    if (updatePromocodeDto.discount) {
      updatePromocodeDto.discount = Number(
        (updatePromocodeDto.discount),
      );
    }

    return this.prisma.promoCode.update({
      where: { id },
      data: {
        ...updatePromocodeDto,
        discount: updatePromocodeDto.discount
          ? Number(updatePromocodeDto.discount)
          : undefined,
        expiresAt: updatePromocodeDto.expiresAt
          ? new Date(updatePromocodeDto.expiresAt)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.promoCode.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }

  async applyPromoCode(code: string) {
    this.logger.debug('Applying promo code', { code });
    const promo = await this.prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isDeleted: false,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!promo) {
      throw new NotFoundException('Invalid or expired promo code');
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    return {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      discount: promo.discount,
    };
  }
}