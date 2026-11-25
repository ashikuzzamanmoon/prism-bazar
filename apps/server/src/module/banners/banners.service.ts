import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateBannerDto, PublishBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { PrismaService } from "src/prisma/prisma";
import { BannerQueryDto } from "./dto/banner-query-dto";
import { Prisma } from "generated/prisma/browser";
import { pagination } from "src/utils/pagination";

@Injectable()
export class BannersService {
  constructor(private readonly prismaService: PrismaService) { }


  public async createNewBanner(createBannerDto: CreateBannerDto) {
    const existing = await this.prismaService.banner.findUnique({
      where: {
        slug: createBannerDto.slug,
      },
    });

    if (existing) {
      throw new ConflictException(`Slug "${createBannerDto.slug}" already exists.`);
    }
    const result = await this.prismaService.banner.create({
      data: createBannerDto,
    });
    return result;
  }

  async getAllBanner(query: BannerQueryDto) {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      type,
      isActive,
      isPublish,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.BannerWhereInput = {

      ...(type ? { type } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
      ...(typeof isPublish === 'boolean' ? { isPublish } : {}),
      ...(searchTerm
        ? {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
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
      this.prismaService.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.banner.count({ where }),
    ]);

    return pagination(data, total, page, limit);
  }

  async getAllQueryBanner() {
    const result = await this.prismaService.banner.findMany({
      where: {
        isDelete: false,
        isPublish: true
      }
    })
    return result
  }


  async findSingleBanner(bannerId: string) {
    const result = await this.prismaService.banner.findFirst({
      where: {
        id: bannerId,
        isDelete: false,
      },
    });

    if (!result) {
      throw new NotFoundException("Banner not found !");
    }

    return result;
  }

  async updateSingleProduct(
    bannerId: string,
    updateBannerDto: UpdateBannerDto
  ) {

    const bannerData = await this.prismaService.banner.findUniqueOrThrow({
      where: {
        id: bannerId,
      },
    });
    const result = await this.prismaService.banner.update({
      where: {
        id: bannerData.id,
      },
      data: updateBannerDto,
    });

    return result;
  }

  public async deleteBanner(bannerId: string) {
    const bannerData = await this.prismaService.banner.findUniqueOrThrow({
      where: {
        id: bannerId,
      },
    });
    const result = await this.prismaService.banner.delete({
      where: {
        id: bannerData.id,
      },
      // data: {
      //   isDelete: true,
      //   isPublish: true,
      // },
    });
    return result;
  }

  public async publishBanner(id: string, payload: PublishBannerDto) {
    const exist = await this.prismaService.banner.findFirst({
      where: {
        id: id
      }
    })
    if (!exist) {
      throw new NotFoundException("Banner not found!")
    }
    const result = await this.prismaService.banner.update({
      where: {
        id: exist.id,
      },
      data: {
        isPublish: payload.publish
      }
    })
    return result
  }

  public async publishSidebarBanner(id: string, payload: any) {
    const exist = await this.prismaService.banner.findFirst({
      where: {
        id: id
      }
    })
    if (!exist) {
      throw new NotFoundException("Banner not found!")
    }
    const result = await this.prismaService.banner.update({
      where: {
        id: exist.id,
      },
      data: {
        isSide: payload.side
      }
    })
    return result
  }

}
