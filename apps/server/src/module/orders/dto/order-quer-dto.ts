import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { OrderStatus, PaymentStatus, PaymentMethod } from 'generated/prisma/enums';
import { QueryDto } from 'src/utils/QueryDto';

export class OrderQueryDto extends QueryDto {
  @ApiPropertyOptional({
    description: 'Filter by order status (comma-separated or array)',
    example: 'PENDING,CONFIRMED',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return [value];
  })
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  orderStatus?: OrderStatus[];

  @ApiPropertyOptional({
    description: 'Filter by payment status (comma-separated or array)',
    example: 'PENDING,SUCCESS',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return [value];
  })
  @IsArray()
  @IsEnum(PaymentStatus, { each: true })
  paymentStatus?: PaymentStatus[];

  @ApiPropertyOptional({
    description: 'Filter by payment type',
    enum: PaymentMethod,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  type?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Filter by promo code ID',
  })
  @IsOptional()
  @IsString()
  promoCodeId?: string;

  @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}