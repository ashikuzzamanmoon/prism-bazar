import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { PrismaService } from "src/prisma/prisma";
import { SslService } from "./order.payment.service";
import { OrdersHelperService } from "./order.helper.service";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "generated/prisma/enums";
import { generateUniqueId } from "./entities/order.entity";
import { Prisma } from "generated/prisma/browser";
import { pagination } from "src/utils/pagination";
import { OrderQueryDto } from "./dto/order-quer-dto";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sslService: SslService,
    private readonly helperService: OrdersHelperService,
  ) {}

  private async reserveOrderInventory(
    tx: Prisma.TransactionClient,
    orderItems: Array<{
      productId: string;
      colorId: string | null;
      quantity: number;
    }>,
  ) {
    for (const item of orderItems) {
      if (item.colorId) {
        const colorStock = await tx.productColor.findUnique({
          where: { id: item.colorId },
        });

        if (!colorStock || colorStock.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for color. Available: ${colorStock?.stock || 0}`,
          );
        }

        await tx.productColor.update({
          where: { id: item.colorId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const inventory = await tx.productInventory.findFirst({
        where: { productId: item.productId },
      });

      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestException("Insufficient stock for product");
      }

      await tx.productInventory.update({
        where: { id: inventory.id },
        data: { quantity: { decrement: item.quantity } },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { sold: { increment: item.quantity } },
      });
    }
  }

  private async restoreOrderInventory(
    tx: Prisma.TransactionClient,
    orderItems: Array<{
      productId: string;
      colorId: string | null;
      quantity: number;
    }>,
  ) {
    for (const item of orderItems) {
      if (item.colorId) {
        await tx.productColor.update({
          where: { id: item.colorId },
          data: { stock: { increment: item.quantity } },
        });
      }

      const inventory = await tx.productInventory.findFirst({
        where: { productId: item.productId },
      });

      if (inventory) {
        await tx.productInventory.update({
          where: { id: inventory.id },
          data: { quantity: { increment: item.quantity } },
        });
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { sold: { decrement: item.quantity } },
      });
    }
  }

  private async upsertOrderTransaction(
    tx: Prisma.TransactionClient,
    order: {
      id: string;
      traxId: string;
      totalAmount: Prisma.TransactionUncheckedCreateInput["amount"];
      type: PaymentMethod;
    },
    paymentStatus: PaymentStatus,
    transactionId?: string,
  ) {
    await tx.transaction.upsert({
      where: { traxId: order.traxId },
      update: {
        status: paymentStatus,
        amount: order.totalAmount,
        type: order.type,
        ...(transactionId !== undefined ? { transactionId } : {}),
      },
      create: {
        orderId: order.id,
        traxId: order.traxId,
        status: paymentStatus,
        amount: order.totalAmount,
        type: order.type,
        transactionId: transactionId || null,
      },
    });
  }

  private isInventoryReleased(state: {
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
  }) {
    return (
      state.paymentStatus === PaymentStatus.FAILED ||
      state.orderStatus === OrderStatus.CANCELLED
    );
  }

  private async validateAndPrepareOrderItems(
    items: CreateOrderDto["items"],
  ): Promise<{
    validatedItems: Array<{
      productId: string;
      colorId: string | null;
      quantity: number;
      price: any;
      optionExtraPrice: number;
      options: any[];
    }>;
    totalAmount: number;
  }> {
    // Fetch all products and colors in parallel
    const productIds = items.map((item) => item.productId);
    const colorIds = items
      .filter((item) => item.colorId)
      .map((item) => item.colorId) as string[];
    const optionIds = items.flatMap(
      (item) => item.options?.map((opt) => opt.optionId) || [],
    );

    const [products, colors, options, inventories] = await Promise.all([
      Promise.all(productIds.map((id) => this.helperService.findProduct(id))),
      colorIds.length > 0
        ? this.prisma.productColor.findMany({ where: { id: { in: colorIds } } })
        : Promise.resolve([]),
      optionIds.length > 0
        ? this.prisma.productOption.findMany({
            where: { id: { in: optionIds } },
          })
        : Promise.resolve([]),
      this.prisma.productInventory.findMany({
        where: { productId: { in: productIds } },
      }),
    ]);

    // Create lookup maps for faster access
    const productMap = new Map(products.map((p) => [p.id, p]));
    const colorMap = new Map(colors.map((c) => [c.id, c]));
    const optionMap = new Map(options.map((o) => [o.id, o]));
    const inventoryMap = new Map(
      inventories.map((inv) => [inv.productId, inv]),
    );

    let totalAmount = 0;
    const validatedItems: Array<{
      productId: string;
      colorId: string | null;
      quantity: number;
      price: any;
      optionExtraPrice: number;
      options: any[];
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product not found: ${item.productId}`);
      }

      if (item.quantity < 1) {
        throw new BadRequestException(
          `Invalid quantity for product ${product.title}`,
        );
      }

      let itemPrice = product.price;
      const deliveryCharge = Number(product.deliveryCharge) || 0;
      if (item.colorId) {
        const productColor = colorMap.get(item.colorId);

        if (!productColor || productColor.productId !== item.productId) {
          throw new BadRequestException(
            `Invalid color for product ${product.title}`,
          );
        }

        if (productColor.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${productColor.name} color. Available: ${productColor.stock}`,
          );
        }

        itemPrice = productColor.basePrice;
      } else {
        const inventory = inventoryMap.get(item.productId);

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.title}. Available: ${inventory?.quantity || 0}`,
          );
        }
      }

      let optionExtraPrice = 0;
      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          const selectedOption = optionMap.get(option.optionId);

          if (!selectedOption || selectedOption.isDeleted) {
            throw new BadRequestException(`Invalid option selected`);
          }

          optionExtraPrice += Number(selectedOption.extraPrice) || 0;
        }
      }

      const itemTotal =
        (Number(itemPrice) + optionExtraPrice + deliveryCharge) * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: item.productId,
        colorId: item.colorId || null,
        quantity: item.quantity,
        price: itemPrice,
        optionExtraPrice,
        options: item.options || [],
      });
    }

    return { validatedItems, totalAmount };
  }

  private async calculateDiscount(
    promoId: string | undefined,
    totalAmount: number,
  ): Promise<number> {
    if (!promoId) return 0;

    const promo = await this.prisma.promoCode.findUnique({
      where: { id: promoId },
    });

    if (!promo) {
      throw new BadRequestException("Invalid Promo Code");
    }

    if (!promo.isActive) {
      throw new BadRequestException("Promo Code is not active");
    }

    if (promo.expiresAt < new Date()) {
      throw new BadRequestException("Promo Code has expired");
    }

    let discountAmount = 0;
    if (promo.type === "FLAT") {
      discountAmount = Number(promo.discount);
    } else {
      discountAmount = (totalAmount * Number(promo.discount)) / 100;
    }

    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    return discountAmount;
  }

  private formatOrderData(order: any) {
    // Format order items
    const formattedItems = order.orderItems.map((item: any) => ({
      id: item.id,
      product: {
        id: item.product.id,
        title: item.product.title,
        modelNumber: item.product.modelNumber,
        slug: item.product.slug,
        images: item.product.productImages
          ? item.product.productImages.map((img: any) => ({
              id: img.id,
              url: img.url,
              altText: img.altText,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
            }))
          : [],
      },
      color: item.color
        ? {
            id: item.color.id,
            name: item.color.name,
            hexCode: item.color.hexCode,
          }
        : null,
      quantity: item.quantity,
      unitPrice: Number(item.price),
      options: item.options.map((opt: any) => ({
        id: opt.option.id,
        value: opt.option.value,
        extraPrice: Number(opt.option.extraPrice),
        group: {
          id: opt.option.group.id,
          title: opt.option.group.title,
          type: opt.option.group.type,
        },
      })),
      itemTotal:
        Number(item.price) * item.quantity +
        item.options.reduce(
          (sum: number, opt: any) => sum + Number(opt.option.extraPrice),
          0,
        ) *
          item.quantity,
    }));

    return {
      id: order.id,
      traxId: order.traxId,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      invoiceDate: order.createdAt,

      customer: {
        name: order.name,
        email: order.email,
        phoneNumber: order.phoneNumber,
        address: order.address,
      },

      items: formattedItems,

      summary: {
        subtotal: Number(order.totalAmount) + Number(order.discount || 0),
        discount: {
          amount: Number(order.discount || 0),
          code: order.promoCode?.code || null,
          type: order.promoCode?.type || null,
        },
        total: Number(order.totalAmount),
      },

      payment: {
        method: order.type || "ONLINE_PAYMENT",
        status: order.paymentStatus,
        transaction:
          order.transactions && order.transactions.length > 0
            ? {
                id: order.transactions[0].id,
                transactionId: order.transactions[0].transactionId,
                amount: Number(order.transactions[0].amount),
                type: order.transactions[0].type,
                status: order.transactions[0].status,
                date: order.transactions[0].createdAt,
              }
            : null,
      },

      timestamps: {
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    };
  }

  async createOrder(dto: CreateOrderDto, userInfo: any) {
    const userId = userInfo.userId;
    const user = await this.helperService.findUser(userId);
    const { validatedItems, totalAmount } =
      await this.validateAndPrepareOrderItems(dto.items);
    const discountAmount = await this.calculateDiscount(
      dto.promoId,
      totalAmount,
    );
    const finalAmount = Math.max(totalAmount - discountAmount, 0);
    const trxId = generateUniqueId("ONLINE");

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          traxId: trxId,
          userId,
          name: dto.name,
          email: dto.email || user.email || "no-email@example.com",
          phoneNumber: dto.phoneNumber,
          address: dto.address,
          totalAmount: finalAmount,
          discount: discountAmount,
          paymentStatus: PaymentStatus.PENDING,
          type: PaymentMethod.ONLINE_PAYMENT,
          orderStatus: OrderStatus.PENDING,
          promoCodeId: dto.promoId
            ? (await tx.promoCode.findUnique({ where: { id: dto.promoId } }))
                ?.id
            : undefined,
          orderItems: {
            create: validatedItems.map((item, idx) => ({
              // ✅ FIXED: Unique traxId per order item
              traxId: `${trxId}-${String(idx + 1).padStart(2, "0")}`,
              productId: item.productId,
              colorId: item.colorId,
              quantity: item.quantity,
              price: item.price,
              options: item.options
                ? {
                    create: item.options.map((opt) => ({
                      optionId: opt.optionId,
                      extraPrice: 0,
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: {
          orderItems: {
            include: { product: true, options: true },
          },
        },
      });

      // ✅ FIXED: Deduct stock immediately to prevent race conditions
      for (const item of createdOrder.orderItems) {
        // Deduct color stock if color selected
        if (item.colorId) {
          const colorStock = await tx.productColor.findUnique({
            where: { id: item.colorId },
          });

          if (!colorStock || colorStock.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for color. Available: ${colorStock?.stock || 0}`,
            );
          }

          await tx.productColor.update({
            where: { id: item.colorId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Deduct from global inventory
        const inventory = await tx.productInventory.findFirst({
          where: { productId: item.productId },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${item.product.title}`,
          );
        }

        await tx.productInventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });

        // Increment sold count
        await tx.product.update({
          where: { id: item.productId },
          data: { sold: { increment: item.quantity } },
        });
      }

      return createdOrder;
    });

    const paymentSession = (await this.sslService.createSession(order)) as any;

    return {
      success: true,
      orderId: order.id,
      traxId: order.traxId,
      subtotal: totalAmount,
      discount: discountAmount,
      totalAmount: finalAmount,
      paymentSession: paymentSession?.GatewayPageURL || null,
    };
  }

  async cashOnOrder(dto: CreateOrderDto, userInfo: any) {
    const userId = userInfo.userId;
    const user = await this.helperService.findUser(userId);

    const { validatedItems, totalAmount } =
      await this.validateAndPrepareOrderItems(dto.items);
    const discountAmount = await this.calculateDiscount(
      dto.promoId,
      totalAmount,
    );

    let deliveryCharge = 0;
    if (dto.deliveryZoneId) {
      const zone = await this.prisma.deliveryZone.findUnique({
        where: { id: dto.deliveryZoneId },
      });
      if (zone) {
        deliveryCharge = Number(zone.deliveryCharge || 0);
      }
    }
    const finalAmount = Math.max(totalAmount - discountAmount, 0) + deliveryCharge;

    const trxId = generateUniqueId("COD");
    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          traxId: trxId,
          userId,
          name: dto.name,
          email: dto.email || user.email || "no-email@example.com",
          phoneNumber: dto.phoneNumber,
          address: dto.address,
          totalAmount: finalAmount,
          discount: discountAmount,
          deliveryZoneId: dto.deliveryZoneId || undefined,
          deliveryCharge: deliveryCharge,
          paymentStatus: PaymentStatus.PENDING,
          type: PaymentMethod.CASH_ON_DELIVERY,
          orderStatus: OrderStatus.PENDING,
          promoCodeId: dto.promoId
            ? (await tx.promoCode.findUnique({ where: { id: dto.promoId } }))
                ?.id
            : undefined,
          orderItems: {
            create: validatedItems.map((item, idx) => ({
              traxId: `${trxId}-${String(idx + 1).padStart(2, "0")}`,
              productId: item.productId,
              colorId: item.colorId,
              quantity: item.quantity,
              price: item.price,
              options: item.options
                ? {
                    create: item.options.map((opt) => ({
                      optionId: opt.optionId,
                      extraPrice: 0,
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: {
          orderItems: {
            include: { product: true, options: true },
          },
        },
      });

      // ✅ FIXED: Deduct stock immediately for COD orders
      for (const item of createdOrder.orderItems) {
        // Deduct color stock if color selected
        if (item.colorId) {
          const colorStock = await tx.productColor.findUnique({
            where: { id: item.colorId },
          });

          if (!colorStock || colorStock.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for color. Available: ${colorStock?.stock || 0}`,
            );
          }

          await tx.productColor.update({
            where: { id: item.colorId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Deduct from global inventory
        const inventory = await tx.productInventory.findFirst({
          where: { productId: item.productId },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${item.product.title}`,
          );
        }

        await tx.productInventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });

        // Increment sold count
        await tx.product.update({
          where: { id: item.productId },
          data: { sold: { increment: item.quantity } },
        });
      }

      // Increment promo usage if applied
      if (createdOrder.promoCodeId) {
        await tx.promoCode.update({
          where: { id: createdOrder.promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return createdOrder;
    });

    return {
      success: true,
      orderId: order.id,
      traxId: order.traxId,
      totalAmount: finalAmount,
      message: "COD order created successfully. Stock reserved.",
    };
  }

  async manualPaymentOrder(dto: CreateOrderDto, userInfo: any) {
    const userId = userInfo.userId;
    const user = await this.helperService.findUser(userId);

    const { validatedItems, totalAmount } =
      await this.validateAndPrepareOrderItems(dto.items);
    const discountAmount = await this.calculateDiscount(
      dto.promoId,
      totalAmount,
    );

    let deliveryCharge = 0;
    if (dto.deliveryZoneId) {
      const zone = await this.prisma.deliveryZone.findUnique({
        where: { id: dto.deliveryZoneId },
      });
      if (zone) {
        deliveryCharge = Number(zone.deliveryCharge || 0);
      }
    }
    const finalAmount = Math.max(totalAmount - discountAmount, 0) + deliveryCharge;

    const paymentType = dto.paymentMethod || PaymentMethod.BKASH_MANUAL;
    const prefix = paymentType === PaymentMethod.NAGAD_MANUAL ? "NGD" : "BKS";
    const trxId = generateUniqueId(prefix);

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          traxId: trxId,
          userId,
          name: dto.name,
          email: dto.email || user.email || "no-email@example.com",
          phoneNumber: dto.phoneNumber,
          address: dto.address,
          totalAmount: finalAmount,
          discount: discountAmount,
          deliveryZoneId: dto.deliveryZoneId || undefined,
          deliveryCharge: deliveryCharge,
          paymentStatus: PaymentStatus.PENDING,
          type: paymentType,
          orderStatus: OrderStatus.PENDING,
          promoCodeId: dto.promoId
            ? (await tx.promoCode.findUnique({ where: { id: dto.promoId } }))?.id
            : undefined,
          orderItems: {
            create: validatedItems.map((item, idx) => ({
              traxId: `${trxId}-${String(idx + 1).padStart(2, "0")}`,
              productId: item.productId,
              colorId: item.colorId,
              quantity: item.quantity,
              price: item.price,
              options: item.options
                ? {
                    create: item.options.map((opt) => ({
                      optionId: opt.optionId,
                      extraPrice: 0,
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: {
          orderItems: {
            include: { product: true, options: true },
          },
        },
      });

      if (dto.transactionId) {
        await tx.transaction.create({
          data: {
            orderId: createdOrder.id,
            traxId: `${trxId}-TX`,
            status: PaymentStatus.PENDING,
            amount: finalAmount,
            transactionId: dto.transactionId,
            type: paymentType,
          },
        });
      }

      for (const item of createdOrder.orderItems) {
        if (item.colorId) {
          const colorStock = await tx.productColor.findUnique({
            where: { id: item.colorId },
          });

          if (!colorStock || colorStock.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for variant. Available: ${colorStock?.stock || 0}`,
            );
          }

          await tx.productColor.update({
            where: { id: item.colorId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const inventory = await tx.productInventory.findFirst({
          where: { productId: item.productId },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${item.product.title}`,
          );
        }

        await tx.productInventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { sold: { increment: item.quantity } },
        });
      }

      if (createdOrder.promoCodeId) {
        await tx.promoCode.update({
          where: { id: createdOrder.promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return createdOrder;
    });

    return {
      success: true,
      orderId: order.id,
      traxId: order.traxId,
      totalAmount: finalAmount,
      message: "Order placed with manual payment. Pending verification.",
    };
  }

  async verifyPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { transactions: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.SUCCESS,
          orderStatus: OrderStatus.CONFIRMED,
        },
      });

      if (order.transactions?.length) {
        await tx.transaction.updateMany({
          where: { orderId },
          data: { status: PaymentStatus.SUCCESS },
        });
      }

      return updatedOrder;
    });
  }

  async handleSuccess(val_id?: string, tran_id?: string) {
    try {
      let validation: any = null;
      if (val_id) {
        validation = await this.sslService.validatePayment(val_id);
      }

      const trxIdForLookup = validation?.tran_id || tran_id;

      if (!trxIdForLookup) {
        throw new BadRequestException("Payment reference not found");
      }

      const order = await this.prisma.order.findUnique({
        where: { traxId: trxIdForLookup },
        include: {
          orderItems: {
            include: { product: true, options: true },
          },
        },
      });

      if (!order) throw new BadRequestException("Order not found");

      if (order.paymentStatus === PaymentStatus.SUCCESS) {
        return true;
      }

      if (!validation || validation.status !== "VALID") {
        throw new BadRequestException("Payment validation failed");
      }

      const receivedAmount = parseFloat(validation.amount).toFixed(2);
      const orderAmount = parseFloat(order.totalAmount.toString()).toFixed(2);

      // Get store_id from validation response - it might be in the response data
      const receivedStoreId = (validation["store_id"] || validation.store_id)
        ?.toString()
        .trim();
      const expectedStoreId = process.env.SSL_STORE_ID?.trim();

      // console.log('💰 Amount Verification:', {
      //   received: receivedAmount,
      //   expected: orderAmount,
      //   match: receivedAmount === orderAmount,
      // });

      // console.log('🏪 Store ID Verification:', {
      //   received: receivedStoreId,
      //   expected: expectedStoreId,
      //   match: receivedStoreId === expectedStoreId,
      // });

      // Only check store ID if it exists in response, otherwise just verify amount
      const storeIdValid = receivedStoreId
        ? receivedStoreId === expectedStoreId
        : true;
      const amountValid = receivedAmount === orderAmount;

      if (!storeIdValid || !amountValid) {
        this.logger.warn("Payment security check failed", {
          storeIdMatch: storeIdValid,
          amountMatch: amountValid,
          receivedStoreId,
          expectedStoreId,
        });
        throw new BadRequestException("Payment validation failed");
      }

      // ✅ ATOMIC TRANSACTION - Stock already deducted at order creation
      await this.prisma.$transaction(async (tx) => {
        // ✅ FIXED: Removed redundant stock deduction - already done in createOrder
        // 1️⃣ Update Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.SUCCESS,
            orderStatus: OrderStatus.CONFIRMED,
          },
        });

        // 2️⃣ Create Transaction
        await tx.transaction.create({
          data: {
            orderId: order.id,
            traxId: trxIdForLookup,
            status: PaymentStatus.SUCCESS,
            amount: Number(validation.amount),
            transactionId: validation.bank_tran_id,
            type: PaymentMethod.ONLINE_PAYMENT,
          },
        });

        this.logger.log("Payment transaction created successfully", {
          orderId: order.id,
          traxId: trxIdForLookup,
        });

        // 3️⃣ Update Promo Usage
        if (order.promoCodeId) {
          await tx.promoCode.update({
            where: { id: order.promoCodeId },
            data: {
              usedCount: { increment: 1 },
            },
          });
        }
      });

      this.logger.log("Order payment processed successfully", {
        orderId: order.id,
        traxId: trxIdForLookup,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Error in handleSuccess: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async handleFail(tran_id: string) {
    // ✅ FIXED: Rollback stock on payment failure
    await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Find order
      const order = await tx.order.findUnique({
        where: { traxId: tran_id },
        include: { orderItems: true },
      });

      if (!order) {
        throw new BadRequestException("Order not found");
      }

      // 2️⃣ Rollback stock unless already rolled back (i.e., not already FAILED/CANCELLED)
      // Stock is deducted at order creation (PENDING status), so rollback on any non-failed payment
      if (order.paymentStatus !== PaymentStatus.FAILED) {
        // Restore stock
        for (const item of order.orderItems) {
          if (item.colorId) {
            await tx.productColor.update({
              where: { id: item.colorId },
              data: { stock: { increment: item.quantity } },
            });
          }

          const inventory = await tx.productInventory.findFirst({
            where: { productId: item.productId },
          });
          if (inventory) {
            await tx.productInventory.update({
              where: { id: inventory.id },
              data: { quantity: { increment: item.quantity } },
            });
          }

          // Decrement sold count
          await tx.product.update({
            where: { id: item.productId },
            data: { sold: { decrement: item.quantity } },
          });
        }
      }

      // 3️⃣ Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          orderStatus: OrderStatus.CANCELLED,
        },
      });

      // 4️⃣ Create failed transaction record
      await tx.transaction.create({
        data: {
          orderId: order.id,
          traxId: tran_id,
          status: PaymentStatus.FAILED,
          amount: order.totalAmount,
          type: PaymentMethod.ONLINE_PAYMENT,
        },
      });

      this.logger.log("Order payment failed and rolled back", {
        orderId: order.id,
        traxId: tran_id,
      });
    });
  }

  async handleIpn(ipnData: any) {
    this.logger.log("IPN handler called", {
      tranId: ipnData?.tran_id,
      status: ipnData?.status,
      amount: ipnData?.amount,
    });

    const { status, tran_id, amount, store_amount, currency } = ipnData;

    this.logger.debug("Extracted IPN fields", {
      status,
      tran_id,
      amount,
      store_id: ipnData.store_id,
      bank_tran_id: ipnData.bank_tran_id,
    });

    // Verify payment status from SSL
    if (status !== "VALID") {
      this.logger.warn("IPN invalid payment status", {
        tranId: tran_id,
        status,
      });
      return { status: "INVALID_PAYMENT_STATUS" };
    }

    // Find order by transaction ID
    const order = await this.prisma.order.findUnique({
      where: { traxId: tran_id },
      include: { orderItems: true },
    });

    if (!order) {
      this.logger.warn("IPN order not found", { tranId: tran_id });
      return { status: "ORDER_NOT_FOUND" };
    }

    this.logger.log("IPN order found", { tranId: tran_id, orderId: order.id });

    // Verify amount matches - use fixed precision comparison
    const receivedIpnAmount = parseFloat(amount).toFixed(2);
    const orderIpnAmount = parseFloat(order.totalAmount.toString()).toFixed(2);

    if (receivedIpnAmount !== orderIpnAmount) {
      this.logger.warn("IPN amount mismatch", {
        tranId: tran_id,
        received: receivedIpnAmount,
        expected: orderIpnAmount,
      });
      return { status: "AMOUNT_MISMATCH" };
    }

    // Verify store ID (security check) - trim whitespace for safe comparison
    // Get store_id from ipnData - use defensive approach
    const ipnStoreId = (ipnData["store_id"] || ipnData.store_id)
      ?.toString()
      .trim();
    const expectedIpnStoreId = process.env.SSL_STORE_ID?.trim();

    // Only check store ID if it exists in response, otherwise just verify amount
    const ipnStoreIdValid = ipnStoreId
      ? ipnStoreId === expectedIpnStoreId
      : true;

    if (!ipnStoreIdValid) {
      this.logger.warn("IPN store verification failed", {
        tranId: tran_id,
        received: ipnStoreId,
        expected: expectedIpnStoreId,
      });
      return { status: "STORE_VERIFICATION_FAILED" };
    }

    // If already processed, return success to prevent duplicate processing
    if (order.paymentStatus === PaymentStatus.SUCCESS) {
      this.logger.warn("IPN order already processed", {
        tranId: tran_id,
        orderId: order.id,
      });
      return { status: "ALREADY_PROCESSED" };
    }

    this.logger.log("Processing IPN payment", {
      tranId: tran_id,
      orderId: order.id,
    });

    // Process payment success atomically
    try {
      await this.prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.SUCCESS,
            orderStatus: OrderStatus.CONFIRMED,
          },
        });

        this.logger.log("IPN order status updated", {
          tranId: tran_id,
          orderId: order.id,
        });

        // ✅ FIXED: Removed stock deduction - already done in createOrder

        // Record transaction
        // ✅ FIXED: Set payment type correctly
        await tx.transaction.create({
          data: {
            orderId: order.id,
            traxId: tran_id,
            status: PaymentStatus.SUCCESS,
            amount: Number(amount),
            transactionId: ipnData.bank_tran_id || null,
            type: PaymentMethod.ONLINE_PAYMENT,
          },
        });

        this.logger.log("IPN transaction recorded", {
          tranId: tran_id,
          orderId: order.id,
        });

        // Increment promo code usage if applied
        if (order.promoCodeId) {
          await tx.promoCode.update({
            where: { id: order.promoCodeId },
            data: { usedCount: { increment: 1 } },
          });
          this.logger.log("IPN promo code usage incremented", {
            tranId: tran_id,
            promoCodeId: order.promoCodeId,
          });
        }
      });

      this.logger.log("IPN payment processed successfully", {
        tranId: tran_id,
        orderId: order.id,
      });
      return { status: "VALID", message: "Payment processed successfully" };
    } catch (error) {
      this.logger.error(
        `IPN processing error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getInvoice(trxId: string) {
    // console.log("trax id checking", trxId)
    const order = await this.prisma.order.findUnique({
      where: { traxId: trxId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            address: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                modelNumber: true,
                slug: true,
                productImages: {
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
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
              },
            },
            options: {
              include: {
                option: {
                  select: {
                    id: true,
                    value: true,
                    extraPrice: true,
                    group: {
                      select: {
                        id: true,
                        title: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        promoCode: {
          select: {
            id: true,
            code: true,
            discount: true,
            type: true,
          },
        },
        transactions: {
          select: {
            id: true,
            traxId: true,
            status: true,
            amount: true,
            type: true,
            transactionId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order not found for transaction ID: ${trxId}`,
      );
    }

    return this.formatOrderData(order);
  }

  async getMyOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        traxId: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        totalAmount: true,
        discount: true,
        paymentStatus: true,
        orderStatus: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                title: true,
                modelNumber: true,
                slug: true,
                productImages: {
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
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
              },
            },
            options: {
              include: {
                option: {
                  select: {
                    id: true,
                    value: true,
                    extraPrice: true,
                    group: {
                      select: {
                        id: true,
                        title: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        promoCode: {
          select: {
            id: true,
            code: true,
            discount: true,
            type: true,
          },
        },
        transactions: {
          select: {
            id: true,
            traxId: true,
            status: true,
            amount: true,
            type: true,
            transactionId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => this.formatOrderData(order));
  }

  async getAllOrders(query: OrderQueryDto) {
    const {
      page = 1,
      limit = 20,
      searchTerm,
      orderStatus,
      paymentStatus,
      type,
      promoCodeId,
      startDate,
      endDate,
      sort = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(orderStatus && orderStatus.length > 0
        ? { orderStatus: { in: orderStatus } }
        : {}),
      ...(paymentStatus && paymentStatus.length > 0
        ? { paymentStatus: { in: paymentStatus } }
        : {}),
      ...(type ? { type } : {}),
      ...(promoCodeId ? { promoCodeId } : {}),
      ...(searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
              { phoneNumber: { contains: searchTerm, mode: "insensitive" } },
              { address: { contains: searchTerm, mode: "insensitive" } },
              { traxId: { contains: searchTerm, mode: "insensitive" } },
            ],
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
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sort]: sortOrder,
        },
        select: {
          id: true,
          traxId: true,
          totalAmount: true,
          discount: true,
          paymentStatus: true,
          orderStatus: true,
          type: true,
          name: true,
          email: true,
          phoneNumber: true,
          address: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  modelNumber: true,
                  slug: true,
                },
              },
              color: {
                select: {
                  id: true,
                  name: true,
                  hexCode: true,
                },
              },
              options: {
                include: {
                  option: {
                    select: {
                      id: true,
                      value: true,
                      extraPrice: true,
                      group: {
                        select: {
                          id: true,
                          title: true,
                          type: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return pagination(data, total, page, limit);
  }

  async getSingleOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            address: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                title: true,
                modelNumber: true,
                slug: true,
              },
            },
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
              },
            },
            options: {
              include: {
                option: {
                  select: {
                    id: true,
                    value: true,
                    extraPrice: true,
                    group: {
                      select: {
                        id: true,
                        title: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        promoCode: {
          select: {
            id: true,
            code: true,
            discount: true,
            type: true,
          },
        },
        transactions: {
          select: {
            id: true,
            traxId: true,
            status: true,
            amount: true,
            type: true,
            transactionId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found for ID: ${orderId}`);
    }

    return this.formatOrderData(order);
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderDto) {
    if (
      !dto.paymentStatus &&
      !dto.orderStatus &&
      dto.transactionId === undefined
    ) {
      throw new BadRequestException("No order update payload provided");
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          select: {
            productId: true,
            colorId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order not found for ID: ${orderId}`);
    }

    const nextPaymentStatus = dto.paymentStatus ?? order.paymentStatus;
    const nextOrderStatus = dto.orderStatus ?? order.orderStatus;

    if (
      nextPaymentStatus === PaymentStatus.SUCCESS &&
      nextOrderStatus !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        "Successful payment requires order status CONFIRMED",
      );
    }

    if (
      nextOrderStatus === OrderStatus.CONFIRMED &&
      nextPaymentStatus !== PaymentStatus.SUCCESS
    ) {
      throw new BadRequestException(
        "CONFIRMED orders require payment status SUCCESS",
      );
    }

    const previousInventoryReleased = this.isInventoryReleased({
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
    const nextInventoryReleased = this.isInventoryReleased({
      paymentStatus: nextPaymentStatus,
      orderStatus: nextOrderStatus,
    });

    await this.prisma.$transaction(async (tx) => {
      if (!previousInventoryReleased && nextInventoryReleased) {
        await this.restoreOrderInventory(tx, order.orderItems);
      }

      if (previousInventoryReleased && !nextInventoryReleased) {
        await this.reserveOrderInventory(tx, order.orderItems);
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: nextPaymentStatus,
          orderStatus: nextOrderStatus,
        },
      });

      if (
        dto.paymentStatus !== undefined ||
        dto.transactionId !== undefined ||
        (nextPaymentStatus === PaymentStatus.SUCCESS &&
          nextOrderStatus === OrderStatus.CONFIRMED)
      ) {
        await this.upsertOrderTransaction(
          tx,
          {
            id: order.id,
            traxId: order.traxId,
            totalAmount: order.totalAmount,
            type: order.type,
          },
          nextPaymentStatus,
          dto.transactionId,
        );
      }
    });

    this.logger.log("Order status updated manually", {
      orderId: order.id,
      paymentStatus: nextPaymentStatus,
      orderStatus: nextOrderStatus,
    });

    return this.getSingleOrder(order.id);
  }
}
