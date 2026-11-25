import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateContentDto } from "./dto/create-content.dto";
import { UpdateContentDto } from "./dto/update-content.dto";
import { PrismaService } from "src/prisma/prisma";
import { ContentQueryDto } from "./dto/content-query.dto";
import { Prisma } from "generated/prisma/client";
import { pagination } from "src/utils/pagination";

@Injectable()
export class ContentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createContentDto: CreateContentDto) {
    return await this.prismaService.content.create({
      data: {
        title: createContentDto.title,
        description: createContentDto.description,
        number: createContentDto.number,
        image: createContentDto.image,
      },
    });
  }

  async findAll(query: ContentQueryDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      sort,
      sortBy,
      sortOrder = "desc",
      skipPagination,
      startDate,
      endDate,
      minNumber,
      maxNumber,
    } = query;

    const skip = (page - 1) * limit;
    const orderByField = sortBy || sort || "createdAt";
    const allowedOrderFields = [
      "createdAt",
      "updatedAt",
      "title",
      "number",
    ] as const;
    const safeOrderByField = allowedOrderFields.includes(
      orderByField as (typeof allowedOrderFields)[number],
    )
      ? orderByField
      : "createdAt";

    const where: Prisma.ContentWhereInput = {
      ...(searchTerm
        ? {
            OR: [
              { title: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
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
      ...(typeof minNumber === "number" || typeof maxNumber === "number"
        ? {
            number: {
              ...(typeof minNumber === "number" ? { gte: minNumber } : {}),
              ...(typeof maxNumber === "number" ? { lte: maxNumber } : {}),
            },
          }
        : {}),
    };

    const orderBy = {
      [safeOrderByField]: sortOrder,
    } as Prisma.ContentOrderByWithRelationInput;

    if (skipPagination) {
      const data = await this.prismaService.content.findMany({
        where,
        orderBy,
      });

      return {
        data,
      };
    }

    const [data, total] = await Promise.all([
      this.prismaService.content.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prismaService.content.count({ where }),
    ]);

    return pagination(data, total, page, limit);
  }

  async getAllQueryContent() {
    return await this.prismaService.content.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const content = await this.prismaService.content.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException("Content not found");
    }

    return content;
  }

  async update(id: string, updateContentDto: UpdateContentDto) {
    await this.findOne(id);

    return await this.prismaService.content.update({
      where: { id },
      data: {
        title: updateContentDto.title,
        description: updateContentDto.description,
        number: updateContentDto.number,
        image: updateContentDto.image,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prismaService.content.delete({
      where: { id },
    });
  }
}
