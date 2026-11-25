import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto, UpdateBrandOrderingDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/prisma/prisma';
import { BrandQueryDto } from './dto/brand-query-dto';
import { Prisma } from 'generated/prisma/browser';
import { pagination } from 'src/utils/pagination';


@Injectable()
export class BrandsService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }

  async create(createBrandDto: CreateBrandDto) {
    const { title, slug, image } = createBrandDto;

    const existingBrand = await this.prismaService.brand.findFirst({
      where: {
        OR: [
          { title: title },
          { slug: slug },
        ],
      },
    });

    if (existingBrand) {
      throw new BadRequestException(
        `Brand with this ${existingBrand.title === title ? 'title' : 'slug'} already exists`,
      );
    }
    const brand = await this.prismaService.brand.create({
      data: {
        title,
        slug: slug || "",
        image
      },
    });

    return brand;
  }

  async findAllBrand() {
    const result = await this.prismaService.brand.findMany({
      where: {
        isDelete: false
      },

    })

    return result

  }

  async findAll(query: BrandQueryDto) {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      isPublish,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = {
      isDelete: false,
      ...(typeof isPublish === 'boolean' ? { isPublish } : {}),
      ...(searchTerm
        ? {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },

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
      this.prismaService.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.brand.count({ where }),
    ]);

    return pagination(data, total, page, limit);


  }


  async getAllQueryBrand() {
    const result = await this.prismaService.brand.findMany({
      where: {
        isDelete: false,
        isPublish: true
      }
    })
    return result
  }

  async findOne(id: string) {
    const result = await this.prismaService.brand.findFirst({
      where: {
        id: id,
        isDelete: false
      }
    })
    return result
  }

  async updateBrand(id: string, updateBrandDto: UpdateBrandDto) {

    const existBrand = await this.prismaService.brand.findFirst({
      where: {
        id: id
      }
    })
    if (!existBrand) {
      throw new NotFoundException("Brand not found!")
    }

    const result = await this.prismaService.brand.update({
      where: {
        id: existBrand.id
      },
      data: updateBrandDto

    })
    return result

  }




  async updateBrandOrdering(payload: { id: string; order: number }[]) {
    const updatePromises = payload.map((item) =>
      this.prismaService.brand.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await Promise.all(updatePromises);

    return { success: true, message: "Brand order updated successfully!" };
  }


  async deleteBrand(id: string) {
    const result = await this.prismaService.brand.update({
      where: {
        id: id
      },
      data: {
        isDelete: true
      }
    })
    return result
  }
}
