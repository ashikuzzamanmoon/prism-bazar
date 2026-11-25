import {
    IsString,
    IsOptional,
    IsArray,
    IsInt,
    ValidateNested,
    IsUUID,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'generated/prisma/enums';

class OrderItemOptionDto {
    @IsString()
    optionId: string;
}

class OrderItemDto {
    @IsString()
    productId: string;

    @IsOptional()
    @IsString()
    colorId?: string;

    @IsInt()
    quantity: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemOptionDto)
    options?: OrderItemOptionDto[];
}

export class CreateOrderDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    promoId?: string;

    @IsOptional()
    @IsString()
    deliveryZoneId?: string;

    @IsOptional()
    @IsString()
    transactionId?: string;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}