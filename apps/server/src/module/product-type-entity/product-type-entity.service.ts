import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductTypeEntityDto } from "./dto/create-product-type-entity.dto";
import { UpdateProductTypeEntityDto } from "./dto/update-product-type-entity.dto";
import { PrismaService } from "src/prisma/prisma";

@Injectable()
export class ProductTypeEntityService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductTypeEntityDto: CreateProductTypeEntityDto) {
    const existing = await this.prismaService.productTypeEntity.findUnique({
      where: { name: createProductTypeEntityDto.name },
    });

    if (existing) {
      throw new BadRequestException("Product type entity already exists");
    }

    return this.prismaService.productTypeEntity.create({
      data: createProductTypeEntityDto,
    });
  }

  async findAll() {
    return this.prismaService.productTypeEntity.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const item = await this.prismaService.productTypeEntity.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException("Product type entity not found");
    }

    return item;
  }

  async update(
    id: string,
    updateProductTypeEntityDto: UpdateProductTypeEntityDto,
  ) {
    await this.findOne(id);

    if (updateProductTypeEntityDto.name) {
      const existingByName =
        await this.prismaService.productTypeEntity.findFirst({
          where: {
            name: updateProductTypeEntityDto.name,
            NOT: { id },
          },
        });

      if (existingByName) {
        throw new BadRequestException(
          "Product type entity name already exists",
        );
      }
    }

    return this.prismaService.productTypeEntity.update({
      where: { id },
      data: updateProductTypeEntityDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const usedInProducts = await this.prismaService.product.count({
      where: { typeId: id },
    });

    if (usedInProducts > 0) {
      throw new BadRequestException(
        "Cannot delete product type entity because it is used by products",
      );
    }

    return this.prismaService.productTypeEntity.delete({
      where: { id },
    });
  }
}
