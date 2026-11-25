import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { PrismaService } from "src/prisma/prisma";
import { CategoryAllQueryDto } from "./dto/category-query-dto";
import { Prisma } from "generated/prisma/client";

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateCollectionsExist(collectionIds: string[]) {
    const collections = await this.prismaService.collection.findMany({
      where: {
        id: { in: collectionIds },
        isDelete: false,
        isActive: true,
      },
      select: { id: true },
    });

    if (collections.length !== collectionIds.length) {
      throw new BadRequestException(
        "One or more collections are invalid or inactive",
      );
    }
  }

  async create(dto: CreateCategoryDto) {
    const { collectionIds, ...categoryData } = dto;

    const slugExists = await this.prismaService.category.findUnique({
      where: { slug: dto.slug },
    });

    if (slugExists) {
      throw new BadRequestException("Category slug already exists");
    }

    if (collectionIds?.length) {
      await this.validateCollectionsExist(collectionIds);
    }

    return this.prismaService.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: categoryData,
      });

      if (collectionIds?.length) {
        await tx.collectionCategory.createMany({
          data: collectionIds.map((id) => ({
            collectionId: id,
            categoryId: category.id,
          })),
        });
      }

      return category;
    });
  }

  async findAll() {
    const categories = await this.prismaService.category.findMany({
      where: {
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isDelete: true,
        isActive: true,
        collectionCategories: {
          where: {
            collection: {
              isActive: true,
              isDelete: false,
            },
          },
          select: {
            collection: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      isDelete: category.isDelete,
      isActive: category.isActive,
      collections: category.collectionCategories.map((cc) => cc.collection),
    }));
  }


  async getAllQueryCategory(query: CategoryAllQueryDto) {
    const { searchTerm, collectionIds } = query;

    const where: Prisma.CategoryWhereInput = {
      isDelete: false,
      isActive: true,
    };

    if (searchTerm) {
      where.name = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }

    if (collectionIds) {
      const collectionIdArray = collectionIds.split(',').map((id) => id.trim());
      where.collectionCategories = {
        some: {
          collectionId: {
            in: collectionIdArray,
          },
        },
      };
    }

    const data = await this.prismaService.category.findMany({
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

    return data.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
  }

  async findOne(id: string) {
    const category = await this.prismaService.category.findFirst({
      where: {
        id,
        isDelete: false,
      },
      include: {
        collectionCategories: {
          include: { collection: true },
        },
      },
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const { collectionIds, ...updateData } = dto;

    const category = await this.prismaService.category.findFirst({
      where: { id, isDelete: false },
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    if (dto.slug) {
      const slugExists = await this.prismaService.category.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });

      if (slugExists) {
        throw new BadRequestException("Category slug already exists");
      }
    }

    if (collectionIds) {
      await this.validateCollectionsExist(collectionIds);
    }

    return this.prismaService.$transaction(async (tx) => {
      const updatedCategory = await tx.category.update({
        where: { id },
        data: updateData,
      });

      if (collectionIds) {
        await tx.collectionCategory.deleteMany({
          where: { categoryId: id },
        });

        if (collectionIds.length) {
          await tx.collectionCategory.createMany({
            data: collectionIds.map((collectionId) => ({
              collectionId,
              categoryId: id,
            })),
          });
        }
      }

      return updatedCategory;
    });
  }

  async remove(id: string) {
    const category = await this.prismaService.category.findFirst({
      where: { id, isDelete: false },
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    return this.prismaService.category.update({
      where: { id },
      data: {
        isDelete: true,
      },
    });
  }
}
