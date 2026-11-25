import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CreateSubCategoryDto } from "./dto/create-sub-category.dto";
import { UpdateSubCategoryDto } from "./dto/update-sub-category.dto";
import { SubCategoryQueryDto } from "./dto/sub-category-query.dto";
import { PrismaService } from "src/prisma/prisma";
import { Prisma } from "generated/prisma/client";

@Injectable()
export class SubCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubCategoryDto) {
    const { slug, categoryIds, ...subCategoryData } = dto;

    const slugExists = await this.prisma.subCategory.findUnique({
      where: { slug },
    });
    if (slugExists)
      throw new BadRequestException("SubCategory slug already exists");

    if (categoryIds?.length) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: categoryIds }, isDelete: false, isActive: true },
        select: { id: true },
      });
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException(
          "One or more categories not found or inactive",
        );
      }
    }

    const subCategory = await this.prisma.$transaction(async (tx) => {
      const created = await tx.subCategory.create({
        data: {
          ...subCategoryData,
          slug,
        },
      });
      if (categoryIds?.length) {
        await tx.categorySubCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            categoryId,
            subCategoryId: created.id,
          })),
        });
      }

      return created;
    });

    return subCategory;
  }

  async findAll() {
    const subCategories = await this.prisma.subCategory.findMany({
      where: {},
      select: {
        id: true,
        name: true,
        slug: true,
        isDelete: true,
        categorySubCategories: {
          select: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return subCategories.map((sc) => ({
      id: sc.id,
      name: sc.name,
      slug: sc.slug,
      isDelete: sc.isDelete,
      categories: sc.categorySubCategories.map((csc) => csc.category),
    }));
  }

  async getAllQuerySubCategory(query: SubCategoryQueryDto) {
    const { searchTerm, categoryIds } = query;

    const where: Prisma.SubCategoryWhereInput = {
      isDelete: false,
    };

    if (searchTerm) {
      where.name = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }

    if (categoryIds) {
      const categoryIdArray = categoryIds.split(',').map((id) => id.trim());
      where.categorySubCategories = {
        some: {
          categoryId: {
            in: categoryIdArray,
          },
        },
      };
    }

    const data = await this.prisma.subCategory.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return data.map((subCategory) => ({
      id: subCategory.id,
      name: subCategory.name,
      slug: subCategory.slug,

    }));
  }

  async findOne(id: string) {
    const subCategory = await this.prisma.subCategory.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        categorySubCategories: {
          select: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!subCategory) throw new NotFoundException("SubCategory not found");

    return {
      id: subCategory.id,
      name: subCategory.name,
      slug: subCategory.slug,
      categories: subCategory.categorySubCategories.map((csc) => csc.category),
    };
  }

  async update(id: string, dto: UpdateSubCategoryDto) {
    const { slug, categoryIds, ...updateData } = dto;

    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id },
    });
    if (!subCategory) throw new NotFoundException("SubCategory not found");

    if (slug) {
      const slugExists = await this.prisma.subCategory.findFirst({
        where: { slug, NOT: { id } },
      });
      if (slugExists)
        throw new BadRequestException("SubCategory slug already exists");
    }

    if (categoryIds?.length) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: categoryIds }, isDelete: false, isActive: true },
        select: { id: true },
      });
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException(
          "One or more categories not found or inactive",
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedSubCategory = await tx.subCategory.update({
        where: { id },
        data: updateData,
      });

      if (categoryIds) {
        await tx.categorySubCategory.deleteMany({
          where: { subCategoryId: id },
        });
        if (categoryIds.length) {
          await tx.categorySubCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              categoryId,
              subCategoryId: id,
            })),
          });
        }
      }

      return updatedSubCategory;
    });

    return updated;
  }

  async remove(id: string) {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id },
    });
    if (!subCategory) throw new NotFoundException("SubCategory not found");

    return this.prisma.subCategory.update({
      where: { id },
      data: { isDelete: true },
    });
  }
}
