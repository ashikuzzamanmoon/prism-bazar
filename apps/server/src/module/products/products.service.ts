import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { PrismaService } from "src/prisma/prisma";
import { AddProductVariantsDto } from "./dto/addProductVariantsDto";
import {
  UpdateProductDto,
  UpdateProductVariantsDto,
} from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query-dto";
import { Prisma } from "generated/prisma/client";
import { ProductCondition, ProductType } from "generated/prisma/enums";
import { pagination } from "src/utils/pagination";
import { UpdateProductPriceDto } from "./dto/update-product-price.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateProductDto) {
    // ✅ Using $transaction directly
    return this.prisma.$transaction(
      async (tx) => {
        const brand = await tx.brand.findUnique({
          where: { id: createDto.brandId },
        });

        if (!brand) throw new BadRequestException("Invalid brand");

        const product = await tx.product.create({
          data: {
            slug: createDto.slug,
            title: createDto.title,
            description: createDto.description,
            brandId: createDto.brandId,
            price: createDto.price,
            basePrice: createDto.basePrice,
            discount: createDto.discount ?? 0,
            prebookPrice: createDto.prebookPrice,
            deliveryCharge: createDto.deliveryCharge,
            condition: createDto.condition,
            ratings: createDto.ratings ?? 0,
            view: createDto.view ?? 0,
            reviewsCount: createDto.reviewsCount ?? 0,
            type: createDto.type,
            typeId: createDto.typeId,
            isPublish: createDto.isPublish ?? false,
            expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
            ingredients: createDto.ingredients,
            nutritionInfo: createDto.nutritionInfo,
            isDigital: createDto.isDigital !== undefined ? createDto.isDigital : false,
            author: createDto.author,
            publisher: createDto.publisher,
            features: createDto.features?.map((item, index) => ({
              id: index + 1,
              key: item.key,
              value: item.value,
            })),
            productImages: createDto.images
              ? { create: createDto.images }
              : undefined,
            productInventories: createDto.inventory
              ? { create: { quantity: createDto.inventory.quantity } }
              : undefined,
            productFeatures: createDto.productFeatures
              ? {
                  create: createDto.productFeatures.map((feature) => ({
                    title: feature.title,
                    image: feature.image,
                    type: feature.type,
                    sortOrder: feature.sortOrder,
                    features: feature.features.map((item, index) => ({
                      id: index + 1,
                      key: item.key,
                      value: item.value,
                    })),
                  })),
                }
              : undefined,
            productCategories: createDto.categoryIds
              ? {
                  create: createDto.categoryIds.map((id) => ({
                    categoryId: id,
                  })),
                }
              : undefined,
            productSubCategories: createDto.subCategoryIds
              ? {
                  create: createDto.subCategoryIds.map((id) => ({
                    subCategoryId: id,
                  })),
                }
              : undefined,
            productCollections: createDto.collectionIds
              ? {
                  create: createDto.collectionIds.map((id) => ({
                    collectionId: id,
                  })),
                }
              : undefined,
          },
          include: {
            productImages: true,
            productFeatures: true,
            productCollections: { select: { collectionId: true } },
            productCategories: { select: { categoryId: true } },
            productSubCategories: { select: { subCategoryId: true } },
          },
        });

        return product;
      },
      {
        timeout: 20000, // 20 seconds
        maxWait: 10000, // wait 10s to acquire connection
      },
    );
  }

  async createProductVariants(payload: AddProductVariantsDto) {
    const { productId, colors, options } = payload;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return this.prisma.$transaction(
      async (prisma) => {
        // === Create Colors ===
        if (colors && colors.length > 0) {
          for (const color of colors) {
            await prisma.productColor.create({
              data: {
                productId,
                name: color.name,
                hexCode: color.hexCode,
                stock: color.stock,
                basePrice: color.basePrice,
                isPublish: color.isPublish ?? true,
                images: {
                  create: color.images.map((img) => ({
                    product: { connect: { id: productId } }, // ✅ Connect product explicitly
                    url: img.url,
                    altText: img.altText,
                    isPrimary: img.isPrimary ?? false,
                    sortOrder: img.sortOrder ?? 0,
                  })),
                },
              },
            });
          }
        }

        // === Create Option Groups and Options ===
        if (options && options.length > 0) {
          for (const group of options) {
            await prisma.productOptionGroup.create({
              data: {
                productId,
                title: group.title,
                type: group.type,
                isPublish: group.isPublish ?? true,
                isDeleted: false,
                options: {
                  create: group.options.map((opt) => ({
                    value: opt.value,
                    extraPrice: opt.extraPrice,
                    isPublish: opt.isPublish ?? true,
                    isDeleted: false,
                  })),
                },
              },
            });
          }
        }

        return { message: "Product variants created successfully" };
      },
      {
        timeout: 20000, // 20 seconds
        maxWait: 10000, // wait 10s to acquire connection
      },
    );
  }

  async update(id: string, updateDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Validate brand if provided
    if (updateDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: updateDto.brandId },
      });

      if (!brand) {
        throw new BadRequestException("Invalid brand");
      }
    }

    const existingProductBySlug = await this.prisma.product.findFirst({
      where: {
        slug: updateDto.slug,
        NOT: { id },
      },
      select: { id: true },
    });

    if (existingProductBySlug) {
      throw new BadRequestException("Slug already exists");
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const updatedProduct = await tx.product.update({
            where: { id },
            data: {
              slug: updateDto.slug,
              title: updateDto.title,
              description: updateDto.description,
              brandId: updateDto.brandId,
              price: updateDto.price,
              basePrice: updateDto.basePrice,
              discount: updateDto.discount ?? 0,
              prebookPrice: updateDto.prebookPrice,
              deliveryCharge: updateDto.deliveryCharge,
              condition: updateDto.condition,
              type: updateDto.type,
              typeId: updateDto.typeId,
              isPublish: updateDto.isPublish,
              expiryDate: updateDto.expiryDate !== undefined ? (updateDto.expiryDate ? new Date(updateDto.expiryDate) : null) : undefined,
              ingredients: updateDto.ingredients,
              nutritionInfo: updateDto.nutritionInfo,
              isDigital: updateDto.isDigital,
              author: updateDto.author,
              publisher: updateDto.publisher,
              ratings: updateDto.ratings ?? 0,
              view: updateDto.view ?? 0,
              reviewsCount: updateDto.reviewsCount ?? 0,
              features: updateDto.features?.map((item, index) => ({
                id: index + 1,
                key: item.key,
                value: item.value,
              })),
              productImages: updateDto.images
                ? {
                    deleteMany: {},
                    create: updateDto.images,
                  }
                : undefined,
              productInventories: updateDto.inventory
                ? {
                    deleteMany: {},
                    create: { quantity: updateDto.inventory.quantity },
                  }
                : undefined,
              productFeatures: updateDto.productFeatures
                ? {
                    deleteMany: {},
                    create: updateDto.productFeatures.map((feature) => ({
                      title: feature.title,
                      image: feature.image,
                      type: feature.type,
                      sortOrder: feature.sortOrder,
                      features: feature.features.map((item, index) => ({
                        id: index + 1,
                        key: item.key,
                        value: item.value,
                      })),
                    })),
                  }
                : undefined,
              productCategories: updateDto.categoryIds
                ? {
                    deleteMany: {},
                    create: updateDto.categoryIds.map((id) => ({
                      categoryId: id,
                    })),
                  }
                : undefined,
              productSubCategories: updateDto.subCategoryIds
                ? {
                    deleteMany: {},
                    create: updateDto.subCategoryIds.map((id) => ({
                      subCategoryId: id,
                    })),
                  }
                : undefined,
              productCollections: updateDto.collectionIds
                ? {
                    deleteMany: {},
                    create: updateDto.collectionIds.map((id) => ({
                      collectionId: id,
                    })),
                  }
                : undefined,
            },
            include: {
              productImages: true,
              productFeatures: true,
              productCollections: { select: { collectionId: true } },
              productCategories: { select: { categoryId: true } },
              productSubCategories: { select: { subCategoryId: true } },
            },
          });

          return updatedProduct;
        },
        {
          timeout: 20000, // 20 seconds
          maxWait: 10000, // wait 10s to acquire connection
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException("Slug already exists");
      }

      throw error;
    }
  }

  async updateProductVariants(id: string, updateDto: UpdateProductVariantsDto) {
    const {
      colors,
      options,
      productId: _productId,
      ...productData
    } = updateDto;

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");

    return this.prisma.$transaction(
      async (prisma) => {
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: productData,
        });

        if (colors !== undefined) {
          await prisma.productImage.deleteMany({
            where: { productId: id, colorId: { not: null } },
          });
          await prisma.productColor.deleteMany({ where: { productId: id } });

          if (colors.length > 0) {
            await Promise.all(
              colors.map((color) =>
                prisma.productColor.create({
                  data: {
                    productId: id,
                    name: color.name,
                    hexCode: color.hexCode,
                    stock: color.stock,
                    basePrice: color.basePrice,
                    isPublish: color.isPublish ?? true,
                    images: {
                      create: color.images.map((img) => ({
                        product: { connect: { id } },
                        url: img.url,
                        altText: img.altText ?? null,
                        isPrimary: img.isPrimary ?? false,
                        sortOrder: img.sortOrder ?? 0,
                      })),
                    },
                  },
                  include: { images: true },
                }),
              ),
            );
          }
        }

        if (options !== undefined) {
          const existingGroups = await prisma.productOptionGroup.findMany({
            where: { productId: id },
            select: {
              id: true,
              options: {
                select: { id: true },
              },
            },
          });
          const groupIds = existingGroups.map((g) => g.id);
          const optionIds = existingGroups.flatMap((g) =>
            g.options.map((option) => option.id),
          );

          if (groupIds.length > 0) {
            if (optionIds.length > 0) {
              await prisma.productOption.updateMany({
                where: { id: { in: optionIds } },
                data: {
                  isDeleted: true,
                  isPublish: false,
                },
              });
            }

            await prisma.productOptionGroup.updateMany({
              where: { id: { in: groupIds } },
              data: {
                isDeleted: true,
                isPublish: false,
              },
            });
          }

          if (options.length > 0) {
            await Promise.all(
              options.map((group) =>
                prisma.productOptionGroup.create({
                  data: {
                    productId: id,
                    title: group.title,
                    type: group.type,
                    isPublish: group.isPublish ?? true,
                    isDeleted: false,
                    options: {
                      create: group.options.map((opt) => ({
                        value: opt.value,
                        extraPrice: opt.extraPrice,
                        isPublish: opt.isPublish ?? true,
                        isDeleted: false,
                      })),
                    },
                  },
                  include: { options: true },
                }),
              ),
            );
          }
        }

        return {
          message: "Product updated successfully",
          product: updatedProduct,
        };
      },
      {
        timeout: 20000,
        maxWait: 10000,
      },
    );
  }

  async getProductForEdit(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productImages: true,
        productFeatures: true,
        productColors: true,
        productOptionGroups: {
          where: { isDeleted: false },
          include: {
            options: {
              where: { isDeleted: false },
            },
          },
        },
        productInventories: { select: { quantity: true } },
        productCategories: { select: { categoryId: true } },
        productSubCategories: { select: { subCategoryId: true } },
        productCollections: { select: { collectionId: true } },
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async getProductVariantsForEdit(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        productColors: {
          include: { images: true },
        },
        productOptionGroups: {
          where: { isDeleted: false },
          include: {
            options: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  async getAllProducts(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      isPublish,
      collectionSlugs,
      categorySlugs,
      subCategorySlugs,
      brandSlugs,
      minPrice,
      maxPrice,
      sortByPrice,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;
    // console.log("searching", searchTerm);

    // Convert slugs to IDs
    let collectionIds: string[] = [];
    let categoryIds: string[] = [];
    let subCategoryIds: string[] = [];
    let brandIds: string[] = [];

    if (collectionSlugs) {
      const collections = await this.prisma.collection.findMany({
        where: {
          slug: {
            in: collectionSlugs.split(",").map((slug) => slug.trim()),
          },
        },
        select: { id: true },
      });
      collectionIds = collections.map((c) => c.id);
    }

    if (categorySlugs) {
      const categories = await this.prisma.category.findMany({
        where: {
          slug: {
            in: categorySlugs.split(",").map((slug) => slug.trim()),
          },
        },
        select: { id: true },
      });
      categoryIds = categories.map((c) => c.id);
    }

    if (subCategorySlugs) {
      const subCategories = await this.prisma.subCategory.findMany({
        where: {
          slug: {
            in: subCategorySlugs.split(",").map((slug) => slug.trim()),
          },
        },
        select: { id: true },
      });
      subCategoryIds = subCategories.map((sc) => sc.id);
    }

    if (brandSlugs) {
      const brands = await this.prisma.brand.findMany({
        where: {
          slug: {
            in: brandSlugs.split(",").map((slug) => slug.trim()),
          },
        },
        select: { id: true },
      });
      brandIds = brands.map((b) => b.id);
    }

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(typeof isPublish === "boolean" ? { isPublish } : {}),
      ...(searchTerm
        ? {
            AND: searchTerm
              .split(/\s+/)
              .filter(Boolean)
              .map((term) => ({
                OR: [
                  { title: { contains: term, mode: "insensitive" as const } },
                  {
                    description: {
                      contains: term,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              })),
          }
        : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          }
        : {}),
      ...(collectionIds.length > 0
        ? {
            productCollections: {
              some: {
                collectionId: {
                  in: collectionIds,
                },
              },
            },
          }
        : {}),
      ...(categoryIds.length > 0
        ? {
            productCategories: {
              some: {
                categoryId: {
                  in: categoryIds,
                },
              },
            },
          }
        : {}),
      ...(subCategoryIds.length > 0
        ? {
            productSubCategories: {
              some: {
                subCategoryId: {
                  in: subCategoryIds,
                },
              },
            },
          }
        : {}),
      ...(brandIds.length > 0
        ? {
            brandId: {
              in: brandIds,
            },
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

    const orderBy: Prisma.ProductOrderByWithRelationInput = sortByPrice
      ? { price: sortByPrice as "asc" | "desc" }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          price: true,
          basePrice: true,
          discount: true,
          prebookPrice: true,
          deliveryCharge: true,
          condition: true,
          ratings: true,
          view: true,
          reviewsCount: true,
          type: true,
          typeEntity: {
            select: {
              id: true,
              name: true,
            },
          },
          isPublish: true,
          features: true,
          ingredients: true,
          nutritionInfo: true,
          isDigital: true,
          author: true,
          publisher: true,
          expiryDate: true,
          brand: {
            select: {
              id: true,
              title: true,
              slug: true,
              image: true,
            },
          },
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
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return pagination(data, total, page, limit);
  }

  async getNewArriveProduct() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        isPublish: true,
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        basePrice: true,
        discount: true,
        type: true,
        condition: true,
        ratings: true,
        sold: true,
        reviewsCount: true,
        createdAt: true,
        productImages: {
          where: { isDeleted: false },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            sortOrder: true,
          },
        },
        productColors: {
          where: { isPublish: true },
          select: {
            id: true,
            name: true,
            hexCode: true,
          },
        },
        productOptionGroups: {
          select: {
            id: true,
            title: true,
          },
          where: { isDeleted: false, isPublish: true },
        },
      },
    });
  }

  async getPreOwnedProduct() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        isPublish: true,
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        basePrice: true,
        discount: true,
        type: true,
        condition: true,
        ratings: true,
        sold: true,
        reviewsCount: true,
        createdAt: true,
        productImages: {
          where: { isDeleted: false },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            sortOrder: true,
          },
        },
        productColors: {
          where: { isPublish: true },
          select: {
            id: true,
            name: true,
            hexCode: true,
          },
        },
        productOptionGroups: {
          select: {
            id: true,
            title: true,
          },
          where: { isDeleted: false, isPublish: true },
        },
      },
    });
  }

  async getTopProduct() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        isPublish: true,
      },
      take: 20,
      orderBy: [{ sold: "desc" }, { ratings: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        basePrice: true,
        discount: true,
        type: true,
        ratings: true,
        reviewsCount: true,
        sold: true,
        productImages: {
          where: { isDeleted: false },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            sortOrder: true,
          },
        },
        productColors: {
          where: { isPublish: true },
          select: {
            id: true,
            name: true,
            hexCode: true,
          },
        },
        productOptionGroups: {
          select: {
            id: true,
            title: true,
          },
          where: { isDeleted: false, isPublish: true },
        },
      },
    });
  }

  async getAccessoriesProduct() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        isPublish: true,
        type: ProductType.ACCESSORY,
        condition: ProductCondition.BRAND_NEW,
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        basePrice: true,
        discount: true,
        type: true,
        condition: true,
        ratings: true,
        sold: true,
        createdAt: true,
        productImages: {
          where: { isDeleted: false },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            sortOrder: true,
          },
        },
        productColors: {
          where: { isPublish: true },
          select: {
            id: true,
            name: true,
            hexCode: true,
          },
        },
        productOptionGroups: {
          select: {
            id: true,
            title: true,
          },
          where: { isDeleted: false, isPublish: true },
        },
      },
    });
  }

  async getProductByIdOrSlug(identifier: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        isDeleted: false,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        basePrice: true,
        discount: true,
        prebookPrice: true,
        deliveryCharge: true,
        condition: true,
        type: true,
        typeEntity: {
          select: {
            id: true,
            name: true,
          },
        },
        ratings: true,
        view: true,
        isPublish: true,
        isDeleted: true,
        reviewsCount: true,
        createdAt: true,
        updatedAt: true,
        features: true,
        ingredients: true,
        nutritionInfo: true,
        isDigital: true,
        author: true,
        publisher: true,
        expiryDate: true,
        brand: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
          },
        },
        productInventories: {
          select: {
            id: true,
            quantity: true,
          },
        },
        productImages: {
          where: { isDeleted: false },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            sortOrder: true,
          },
        },
        productFeatures: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            image: true,
            type: true,
            sortOrder: true,
            features: true,
          },
        },
        productColors: {
          where: { isPublish: true },
          select: {
            id: true,
            name: true,
            hexCode: true,
            stock: true,
            basePrice: true,
            isPublish: true,
            images: {
              where: { isDeleted: false },
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                url: true,
                altText: true,
                isPrimary: true,
                sortOrder: true,
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
              where: { isDeleted: false, isPublish: true },
            },
          },
          where: { isDeleted: false, isPublish: true },
        },
        productCategories: {
          select: {
            categoryId: true,
          },
        },
        productSubCategories: {
          select: {
            subCategoryId: true,
          },
        },
        productCollections: {
          select: {
            collectionId: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return {
      success: true,
      data: product,
    };
  }

  async getAllQueryProducts() {
    const products = await this.prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        slug: true,
        title: true,
        condition: true,
        productImages: true,
      },
    });
    return products;
  }

  async getRelevantProducts(query: any) {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      collectionIds,
      categoryIds,
    } = query;

    const skip = (page - 1) * limit;

    // Parse comma-separated IDs
    let parsedCollectionIds: string[] = [];
    let parsedCategoryIds: string[] = [];

    if (collectionIds && typeof collectionIds === "string") {
      parsedCollectionIds = collectionIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);
    }

    if (categoryIds && typeof categoryIds === "string") {
      parsedCategoryIds = categoryIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);
    }

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      isPublish: true,
      ...(searchTerm
        ? {
            OR: [
              { title: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(parsedCollectionIds.length > 0
        ? {
            productCollections: {
              some: {
                collectionId: {
                  in: parsedCollectionIds,
                },
              },
            },
          }
        : {}),
      ...(parsedCategoryIds.length > 0
        ? {
            productCategories: {
              some: {
                categoryId: {
                  in: parsedCategoryIds,
                },
              },
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          price: true,
          basePrice: true,
          discount: true,
          prebookPrice: true,
          deliveryCharge: true,
          condition: true,
          type: true,
          isPublish: true,
          createdAt: true,
          updatedAt: true,
          features: true,
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
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    return pagination(data, total, page, limit);
  }

  async getProductPublishUnPublish(id: string, publish: boolean) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.prisma.product.update({
      where: { id },
      data: { isPublish: publish },
    });
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true, isPublish: false },
    });

    return { message: "Product deleted successfully" };
  }

  //Sorting related api
  async singleProductMainFeatureSorting(productId: string) {
    const products = await this.prisma.product.findUnique({
      where: { isDeleted: false, id: productId },
      select: {
        id: true,
        features: true,
      },
    });
    if (!products) {
      throw new NotFoundException("Product not found");
    }
    return products;
  }

  /**
   * Service 1: Get all ProductFeatures by ProductId with sorting
   * Returns all ProductFeature records for a product, sorted by sortOrder
   */
  async getAllProductFeaturesByProductId(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isDeleted: false },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const productFeatures = await this.prisma.productFeature.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        image: true,
        type: true,
        sortOrder: true,
        features: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      productId,
      totalFeatures: productFeatures.length,
      features: productFeatures,
    };
  }

  /**
   * Service 2: Update ProductFeature sorting by sortOrder
   * Updates the sortOrder of ProductFeatures within a product
   */
  async updateProductFeatureSorting(
    productId: string,
    sortingData: Array<{ featureId: string; sortOrder: number }>,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isDeleted: false },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return this.prisma.$transaction(
      async (tx) => {
        const updatedFeatures = await Promise.all(
          sortingData.map((item) =>
            tx.productFeature.update({
              where: { id: item.featureId },
              data: { sortOrder: item.sortOrder },
              select: {
                id: true,
                title: true,
                sortOrder: true,
                type: true,
              },
            }),
          ),
        );

        return {
          message: "Product features sorted successfully",
          productId,
          features: updatedFeatures.sort((a, b) => a.sortOrder - b.sortOrder),
        };
      },
      {
        timeout: 20000,
        maxWait: 10000,
      },
    );
  }

  /**
   * Service 3: Update main Product features (JSON) sorting
   * Updates the features array on the Product model with new order
   */
  async updateProductMainFeatureSorting(
    productId: string,
    sortedFeatures: Array<{ id: number; key: string; value: string }>,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isDeleted: false },
      select: { id: true, features: true },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        features: sortedFeatures,
      },
      select: {
        id: true,
        features: true,
        updatedAt: true,
      },
    });

    return {
      message: "Product main features sorted successfully",
      data: updated,
    };
  }

  /**
   * Service 4: Get ProductFeature with its features JSON
   * Retrieves a specific ProductFeature by ID with its features array
   */
  async getProductFeatureById(featureId: string) {
    const productFeature = await this.prisma.productFeature.findUnique({
      where: { id: featureId },
      select: {
        id: true,
        productId: true,
        title: true,
        image: true,
        type: true,
        sortOrder: true,
        features: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!productFeature) {
      throw new NotFoundException("ProductFeature not found");
    }

    return {
      feature: productFeature,
      itemsCount: productFeature.features
        ? (productFeature.features as Array<any>).length
        : 0,
    };
  }

  /**
   * Service 5: Update ProductFeature's features (JSON) sorting
   * Updates the features array within a ProductFeature record with new order
   */
  async updateProductFeatureFeaturesSorting(
    featureId: string,
    sortedFeatures: Array<{ id: number; key: string; value: string }>,
  ) {
    const productFeature = await this.prisma.productFeature.findUnique({
      where: { id: featureId },
      select: { id: true, productId: true },
    });

    if (!productFeature) {
      throw new NotFoundException("ProductFeature not found");
    }

    const updated = await this.prisma.productFeature.update({
      where: { id: featureId },
      data: {
        features: sortedFeatures,
      },
      select: {
        id: true,
        productId: true,
        title: true,
        type: true,
        features: true,
        updatedAt: true,
      },
    });

    return {
      message: "ProductFeature features sorted successfully",
      data: updated,
    };
  }

  async getProductInventory() {
    const products = await this.prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        title: true,
        price: true,
        productImages: {
          select: {
            id: true,
            url: true,
          },
        },
        productInventories: {
          select: {
            id: true,
            quantity: true,
          },
        },
        productColors: {
          select: {
            id: true,
            name: true,
            hexCode: true,
            stock: true,
          },
        },
      },
    });
    return products;
  }
  // update product price

  async updateProductInventory(id: string, dto: UpdateProductPriceDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, price: true },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const hasPriceUpdate = dto.price !== undefined && dto.price !== null;
    const hasInventoryUpdate =
      dto.inventoryQuantity !== undefined && dto.inventoryQuantity !== null;
    const hasColorStockUpdate =
      Array.isArray(dto.colorStocks) && dto.colorStocks.length > 0;

    if (!hasPriceUpdate && !hasInventoryUpdate && !hasColorStockUpdate) {
      throw new BadRequestException(
        "At least one field is required: price, inventoryQuantity, or colorStocks",
      );
    }

    if (hasPriceUpdate && dto.price! < 0) {
      throw new BadRequestException("price must be >= 0");
    }

    if (hasInventoryUpdate && dto.inventoryQuantity! < 0) {
      throw new BadRequestException("inventoryQuantity must be >= 0");
    }

    if (
      hasColorStockUpdate &&
      dto.colorStocks!.some((item) => item.stock < 0)
    ) {
      throw new BadRequestException("color stock must be >= 0");
    }

    return this.prisma.$transaction(
      async (tx) => {
        if (hasPriceUpdate) {
          await tx.product.update({
            where: { id },
            data: {
              price: dto.price,
            },
          });
        }

        if (hasInventoryUpdate) {
          const inventory = await tx.productInventory.findFirst({
            where: { productId: id },
            select: { id: true },
          });

          if (inventory) {
            await tx.productInventory.update({
              where: { id: inventory.id },
              data: { quantity: dto.inventoryQuantity },
            });
          } else {
            await tx.productInventory.create({
              data: {
                productId: id,
                quantity: dto.inventoryQuantity!,
              },
            });
          }
        }

        if (hasColorStockUpdate) {
          const colorIds = dto.colorStocks!.map((item) => item.colorId);
          const existingColors = await tx.productColor.findMany({
            where: {
              productId: id,
              id: { in: colorIds },
            },
            select: { id: true },
          });

          const existingColorIdSet = new Set(existingColors.map((c) => c.id));
          const invalidColorIds = colorIds.filter(
            (colorId) => !existingColorIdSet.has(colorId),
          );

          if (invalidColorIds.length > 0) {
            throw new BadRequestException(
              `Invalid product color id(s): ${invalidColorIds.join(", ")}`,
            );
          }

          await Promise.all(
            dto.colorStocks!.map((item) =>
              tx.productColor.update({
                where: { id: item.colorId },
                data: { stock: item.stock },
              }),
            ),
          );
        }

        const updated = await tx.product.findUnique({
          where: { id },
          select: {
            id: true,
            price: true,
            updatedAt: true,
            productInventories: {
              select: {
                id: true,
                quantity: true,
              },
            },
            productColors: {
              select: {
                id: true,
                name: true,
                hexCode: true,
                stock: true,
              },
            },
          },
        });

        return updated;
      },
      {
        timeout: 20000,
        maxWait: 10000,
      },
    );
  }
}
