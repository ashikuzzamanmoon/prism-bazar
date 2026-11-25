import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderQueryDto } from "./dto/order-quer-dto";
import { CurrentUser } from "src/authentication/current-user.decorator";
import { API_VERSION } from "src/utils/api-verstion";
import { JwtAuthGuard } from "src/authentication/jwt-auth.guard";
import { Roles } from "src/authentication/roles.decorator";
import { RolesGuard } from "src/authentication/roles.guard";
import { RoleType } from "generated/prisma/enums";

@Controller({
  path: "orders",
  version: API_VERSION.V1,
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.createOrder(createOrderDto, user);
  }

  @Post("cash-on-delivery")
  @UseGuards(JwtAuthGuard)
  async cashOnOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.ordersService.cashOnOrder(createOrderDto, user);
    return {
      success: true,
      trxId: result?.traxId,
      redirectUrl: `${process.env.SUCCESS_URL}?trxId=${result?.traxId}`,
    };
  }

  @Post("manual-payment")
  @UseGuards(JwtAuthGuard)
  async manualPaymentOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.ordersService.manualPaymentOrder(
      createOrderDto,
      user,
    );
    return {
      success: true,
      trxId: result?.traxId,
      message: result?.message,
      redirectUrl: `${process.env.SUCCESS_URL}?trxId=${result?.traxId}`,
    };
  }

  @Patch(":id/verify-payment")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  async verifyPayment(@Param("id") id: string) {
    const data = await this.ordersService.verifyPayment(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Order payment verified successfully",
      data,
    };
  }

  @Get("my-orders")
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@CurrentUser() user: any) {
    return this.ordersService.getMyOrders(user.userId);
  }

  @Get("all-orders")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async getAllOrders(@Query() query: OrderQueryDto) {
    const result = await this.ordersService.getAllOrders(query);
    return {
      statusCode: HttpStatus.OK,
      message: "Orders fetched successfully",
      data: result,
    };
  }

  @Get("order/:orderId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async getSingleOrder(@Param("orderId") orderId: string) {
    const result = await this.ordersService.getSingleOrder(orderId);
    return {
      statusCode: HttpStatus.OK,
      message: "Order fetched successfully",
      data: result,
    };
  }

  @Patch("order/:orderId/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async updateOrderStatus(
    @Param("orderId") orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const result = await this.ordersService.updateOrderStatus(
      orderId,
      updateOrderDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: "Order updated successfully",
      data: result,
    };
  }

  @Get(":trxId")
  @UseGuards(JwtAuthGuard)
  async getInvoice(@Param("trxId") trxId: string) {
    return this.ordersService.getInvoice(trxId);
  }
}
