import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrderStatus, PaymentStatus } from "generated/prisma/enums";

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
