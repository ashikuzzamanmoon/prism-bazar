import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { CollectionQueryDto } from "./dto/collection-query-dto";
import { Prisma } from "generated/prisma/client";
import { pagination } from "src/utils/pagination";

@Injectable()
export class CollectionService {
  constructor(private prismaService: PrismaService) {}

  private async generateUniqueSlug(name: string, id?: string): Promise<string> {
    let baseSlug = name.toLowerCase().replace(/\s+/g, "-");
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prismaService.collection.findFirst({
        where: {
          slug,
          id: id ? { not: id } : undefined,
        },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async create(dto: CreateCollectionDto) {
    const slug = dto.slug
      ? await this.generateUniqueSlug(dto.slug)
      : await this.generateUniqueSlug(dto.name);

    return this.prismaService.collection.create({
      data: {
        name: dto.name,
        slug,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(query: CollectionQueryDto) {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      isActive,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.CollectionWhereInput = {
      isDelete: false,
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(searchTerm
        ? {
            OR: [{ name: { contains: searchTerm, mode: "insensitive" } }],
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
      this.prismaService.collection.findMany({
        where,
        skip,
        take: limit,
        include: {
          collectionCategories: {
            include: {
              category: {
                include: {
                  categorySubCategories: {
                    include: {
                      subCategory: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      this.prismaService.collection.count({ where }),
    ]);

    const formattedData = data.map((collection) => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      isActive: collection.isActive,
      isHomeShow: collection.isHomeShow,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      categories: collection.collectionCategories
        .filter((cc) => !cc.category.isDelete && cc.category.isActive)
        .map((cc) => ({
          id: cc.category.id,
          name: cc.category.name,
          slug: cc.category.slug,
          isActive: cc.category.isActive,
          isSelected: true,
          subCategories: cc.category.categorySubCategories
            .filter((cs) => !cs.subCategory.isDelete)
            .map((cs) => ({
              id: cs.subCategory.id,
              name: cs.subCategory.name,
              slug: cs.subCategory.slug,
              isSelected: true,
            })),
          totalSubCategories: cc.category.categorySubCategories.filter(
            (cs) => !cs.subCategory.isDelete,
          ).length,
        })),
      totalCategories: collection.collectionCategories.filter(
        (cc) => !cc.category.isDelete && cc.category.isActive,
      ).length,
    }));

    return pagination(formattedData, total, page, limit);
  }

  async getAllQueryCollection() {
    const data = await this.prismaService.collection.findMany({
      where: {
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return data;
  }

  async findAllForLanding() {
    const collections = await this.prismaService.collection.findMany({
      where: { isDelete: false, isActive: true },
      include: {
        collectionCategories: {
          where: {
            category: {
              isDelete: false,
              isActive: true,
            },
          },
          include: {
            category: {
              include: {
                categorySubCategories: {
                  where: {
                    subCategory: {
                      isDelete: false,
                    },
                  },
                  include: {
                    subCategory: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    console.log("collections", collections);

    return collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      categories: collection.collectionCategories.map((cc) => ({
        id: cc.category.id,
        name: cc.category.name,
        slug: cc.category.slug,
        subCategories: cc.category.categorySubCategories.map((cs) => ({
          id: cs.subCategory.id,
          name: cs.subCategory.name,
          slug: cs.subCategory.slug,
        })),
      })),
    }));
  }

  async getCollectionProducts() {
    const collections = await this.prismaService.collection.findMany({
      where: {
        isDelete: false,
        isHomeShow: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        productCollections: {
          where: {
            product: {
              isDeleted: false,
              isPublish: true,
            },
          },
          take: 10,
          orderBy: {
            product: {
              createdAt: "desc",
            },
          },
          select: {
            product: {
              select: {
                id: true,
                slug: true,
                title: true,
                modelNumber: true,
                description: true,
                price: true,
                basePrice: true,
                discount: true,
                prebookPrice: true,
                deliveryCharge: true,
                condition: true,
                ratings: true,
                view: true,
                type: true,
                isPublish: true,
                features: true,
                createdAt: true,
                updatedAt: true,
                productInventories: {
                  select: {
                    id: true,
                    quantity: true,
                  },
                },
                productImages: {
                  select: {
                    id: true,
                    url: true,
                    altText: true,
                    isPrimary: true,
                    sortOrder: true,
                  },
                },
                productFeatures: {
                  select: {
                    id: true,
                    title: true,
                    image: true,
                    type: true,
                    sortOrder: true,
                  },
                },
                productColors: {
                  select: {
                    id: true,
                    name: true,
                    hexCode: true,
                    stock: true,
                    basePrice: true,
                    isPublish: true,
                    images: {
                      select: {
                        id: true,
                        url: true,
                        isPrimary: true,
                      },
                    },
                  },
                },
                productOptionGroups: {
                  select: {
                    id: true,
                    title: true,
                    type: true,
                    isPublish: true,
                    options: {
                      select: {
                        id: true,
                        value: true,
                        extraPrice: true,
                        isPublish: true,
                      },
                      where: { isDeleted: false },
                    },
                  },
                  where: { isDeleted: false },
                },
              },
            },
          },
        },
      },
    });

    const collectionIds = collections.map((collection) => collection.id);

    const productCounts = collectionIds.length
      ? await this.prismaService.productCollection.groupBy({
          by: ["collectionId"],
          where: {
            collectionId: { in: collectionIds },
            product: {
              isDeleted: false,
              isPublish: true,
            },
          },
          _count: {
            _all: true,
          },
        })
      : [];

    const countMap = new Map(
      productCounts.map((item) => [item.collectionId, item._count._all]),
    );

    return collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      productCount: countMap.get(collection.id) ?? 0,
      products: collection.productCollections.map((item) => item.product),
    }));
  }

  async findOne(id: string) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id },
      // include: { categories: true },
    });
    if (!collection) throw new NotFoundException("Collection not found");
    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id },
    });
    if (!collection) throw new NotFoundException("Collection not found");

    const slug = dto.name
      ? await this.generateUniqueSlug(dto.name, id)
      : collection.slug;

    return this.prismaService.collection.update({
      where: { id },
      data: {
        name: dto.name ?? collection.name,
        slug,
        isActive: dto.isActive ?? collection.isActive,
        isHomeShow: dto.isHomeShow ?? collection.isHomeShow,
      },
    });
  }

  async updateIsHomeShow(id: string, isHomeShow: boolean) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id },
    });
    if (!collection) throw new NotFoundException("Collection not found");

    return this.prismaService.collection.update({
      where: { id },
      data: {
        isHomeShow,
      },
    });
  }

  async remove(id: string) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id },
    });
    if (!collection) throw new NotFoundException("Collection not found");

    return this.prismaService.collection.update({
      where: { id },
      data: {
        isActive: false,
        isDelete: true,
      },
    });
  }
}
