import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma';

@Injectable()
export class OrdersHelperService {
    constructor(private readonly prisma: PrismaService) { }

    async findUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                isActive: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.isActive) {
            throw new BadRequestException('User account is inactive');
        }

        return user;
    }

    async findProduct(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id, isDeleted: false },
            select: {
                id: true,
                title: true,
                price: true,
                basePrice: true,
                deliveryCharge: true,
                isPublish: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (!product.isPublish) {
            throw new BadRequestException('Product is not available for purchase');
        }

        return product;
    }

    async validateProductColor(colorId: string, productId: string) {
        const color = await this.prisma.productColor.findUnique({
            where: { id: colorId },
            select: {
                id: true,
                productId: true,
                name: true,
                stock: true,
                basePrice: true,
                isPublish: true,
            },
        });

        if (!color) {
            throw new NotFoundException('Color not found');
        }

        if (color.productId !== productId) {
            throw new BadRequestException('Color does not belong to this product');
        }

        if (!color.isPublish) {
            throw new BadRequestException('Color is not available');
        }

        return color;
    }

    async validateProductOption(optionId: string) {
        const option = await this.prisma.productOption.findUnique({
            where: { id: optionId },
            select: {
                id: true,
                value: true,
                extraPrice: true,
                isPublish: true,
                isDeleted: true,
            },
        });

        if (!option || option.isDeleted) {
            throw new NotFoundException('Option not found or is deleted');
        }

        if (!option.isPublish) {
            throw new BadRequestException('Option is not available');
        }

        return option;
    }

    async validatePromoCode(promoId: string) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { id:promoId },
            select: {
                id: true,
                code: true,
                type: true,
                discount: true,
                isActive: true,
                expiresAt: true,
                usageLimit: true,
                usedCount: true,
                perUserLimit: true,
            },
        });

        if (!promo) {
            throw new BadRequestException('Invalid Promo Code');
        }

        if (!promo.isActive) {
            throw new BadRequestException('Promo Code is not active');
        }

        if (promo.expiresAt < new Date()) {
            throw new BadRequestException('Promo Code has expired');
        }

        return promo;
    }
}