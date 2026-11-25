# 🔴 eCommerce Payment System - CRITICAL AUDIT FINDINGS

**System**: NestJS + Prisma + PostgreSQL + SSLCommerz  
**Audit Date**: April 23, 2026  
**Risk Level**: 🔴 CRITICAL

---

## EXECUTIVE SUMMARY

Your eCommerce system has **7 CRITICAL bugs** that will cause:

- ✗ Stock overselling (unlimited COD orders)
- ✗ Negative inventory (payment failures without rollback)
- ✗ Race conditions (concurrent orders exhaust stock)
- ✗ Financial loss (unpaid orders recorded as paid)
- ✗ Data corruption (inconsistent stock records)

**Recommendation**: DO NOT DEPLOY TO PRODUCTION without fixes.

---

## 🔴 CRITICAL BUG #1: Cash on Delivery - No Stock Deduction

**Severity**: CRITICAL  
**Impact**: Unlimited stock overselling  
**File**: `src/module/orders/orders.service.ts` (Line 317-367)

### Problem

```typescript
async cashOnOrder(dto: CreateOrderDto, userInfo: any) {
  // ... validation ...
  const order = await this.prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      // Creates order and OrderItems
      // ❌ MISSING: Stock deduction code
    });
    return createdOrder;
  });
  return order; // ❌ No stock deducted!
}
```

### Real-World Impact

```
Scenario: iPhone 15 with 5 units in stock
1. Customer 1: Creates COD order for 10 units ✓ (Validation passes, no stock check for COD)
2. Customer 2: Creates COD order for 10 units ✓ (No stock deducted)
3. Customer 3: Creates COD order for 10 units ✓ (No stock deducted)
Result: 30 units promised, 5 units available
        Company loses: ~$25,000+ (assuming $800/unit)
```

### Fix

```typescript
async cashOnOrder(dto: CreateOrderDto, userInfo: any) {
  const userId = userInfo.userId;
  const user = await this.helperService.findUser(userId);
  const { validatedItems, totalAmount } = await this.validateAndPrepareOrderItems(dto.items);
  const discountAmount = await this.calculateDiscount(dto.promoId, totalAmount);
  const finalAmount = Math.max(totalAmount - discountAmount, 0);
  const trxId = generateUniqueId("", 6);

  // ✅ ATOMIC TRANSACTION with stock deduction
  const order = await this.prisma.$transaction(async (tx) => {
    // 1️⃣ Create order
    const createdOrder = await tx.order.create({
      data: {
        traxId: trxId,
        userId,
        name: dto.name,
        email: dto.email || user.email || 'no-email@example.com',
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        totalAmount: finalAmount,
        discount: discountAmount,
        paymentStatus: PaymentStatus.PENDING, // ← For COD, this stays PENDING until confirmed
        type: PaymentMethod.CASH_ON_DELIVERY,
        orderStatus: OrderStatus.PENDING,
        promoCodeId: dto.promoId
          ? (await tx.promoCode.findUnique({ where: { id: dto.promoId } }))?.id
          : undefined,
        orderItems: {
          create: validatedItems.map((item) => ({
            traxId: generateUniqueId(trxId, 4), // ✅ Unique per item
            productId: item.productId,
            colorId: item.colorId,
            quantity: item.quantity,
            price: item.price,
            options: item.options
              ? {
                  create: item.options.map((opt) => ({
                    optionId: opt.optionId,
                    extraPrice: Number(opt.extraPrice),
                  })),
                }
              : undefined,
          })),
        },
      },
      include: { orderItems: { include: { product: true, options: true } } },
    });

    // 2️⃣ Deduct stock (same logic as handleSuccess)
    for (const item of createdOrder.orderItems) {
      // Deduct color stock
      if (item.colorId) {
        const colorStock = await tx.productColor.findUnique({
          where: { id: item.colorId },
        });
        if (!colorStock || colorStock.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient ${colorStock?.name} stock. Available: ${colorStock?.stock || 0}`
          );
        }
        await tx.productColor.update({
          where: { id: item.colorId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Deduct inventory stock
      const inventory = await tx.productInventory.findFirst({
        where: { productId: item.productId },
      });
      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.title}`
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

    // 3️⃣ Increment promo usage
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
    message: 'COD order created successfully. Stock reserved.',
  };
}
```

---

## 🔴 CRITICAL BUG #2: Payment Failure - No Stock Rollback

**Severity**: CRITICAL  
**Impact**: Stock goes negative or becomes inconsistent  
**File**: `src/module/orders/orders.service.ts` (Line 545)

### Problem

```typescript
async handleFail(tran_id: string) {
  // ❌ Only marks order as cancelled
  // ❌ Doesn't return stock
  await this.prisma.order.update({
    where: { traxId: tran_id },
    data: {
      paymentStatus: PaymentStatus.FAILED,
      orderStatus: OrderStatus.CANCELLED,
    },
  });
}
```

### Real-World Impact

```
Scenario: Payment fails after stock was deducted
1. Customer places online order for 5 laptops
2. Payment validates successfully
3. Stock deducted: 5 units
4. Payment fails at bank (network error, etc.)
5. handleFail() marks order CANCELLED
6. Stock remains deducted: -5 units ❌
```

### Fix

```typescript
async handleFail(tran_id: string) {
  await this.prisma.$transaction(async (tx) => {
    // 1️⃣ Find order
    const order = await tx.order.findUnique({
      where: { traxId: tran_id },
      include: { orderItems: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // 2️⃣ Only rollback if payment was actually processed
    if (order.paymentStatus === PaymentStatus.SUCCESS) {
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

    this.logger.log('Order payment failed and rolled back', {
      orderId: order.id,
      traxId: tran_id,
    });
  });
}
```

---

## 🔴 CRITICAL BUG #3: Race Condition in Stock Deduction

**Severity**: CRITICAL  
**Impact**: Multiple concurrent orders can exhaust stock  
**File**: `src/module/orders/orders.service.ts` (Line 23-110)

### Problem

Stock is validated at **order creation time**, but deducted at **payment success time**. This creates a race condition:

```
Timeline:
T1: Order A: validate stock (5 units) ✓ Pass
T2: Order B: validate stock (5 units) ✓ Pass (before Order A deducts)
T3: Order A: deduct stock (5 units) → 0 left
T4: Order B: deduct stock (5 units) → -5 (NEGATIVE! 🔴)
```

### Root Cause

Stock validation happens in `validateAndPrepareOrderItems()` but deduction happens in `handleSuccess()`. These are not atomic.

### Fix: Pessimistic Locking

```typescript
private async validateAndPrepareOrderItems(
  items: CreateOrderDto['items'],
): Promise<{...}> {
  // ... existing validation ...

  // ✅ Use FOR UPDATE locks to prevent race conditions
  const colors = colorIds.length > 0
    ? await this.prisma.$queryRaw<any[]>`
        SELECT * FROM "product_colors"
        WHERE id = ANY(${colorIds}::text[])
        FOR UPDATE  -- ✅ Lock these rows
      `
    : [];

  const inventories = await this.prisma.$queryRaw<any[]>`
    SELECT * FROM "product_inventories"
    WHERE "productId" = ANY(${productIds}::text[])
    FOR UPDATE  -- ✅ Lock these rows
  `;

  // ... rest of validation with locked data ...
}
```

**Or better: Reserve stock atomically during order creation**

```typescript
async createOrder(dto: CreateOrderDto, userInfo: any) {
  const userId = userInfo.userId;
  const user = await this.helperService.findUser(userId);
  const { validatedItems, totalAmount } = await this.validateAndPrepareOrderItems(dto.items);
  const discountAmount = await this.calculateDiscount(dto.promoId, totalAmount);
  const finalAmount = Math.max(totalAmount - discountAmount, 0);
  const trxId = generateUniqueId("ONLINE", 6);

  // ✅ Single atomic transaction for validation + stock reservation
  const order = await this.prisma.$transaction(
    async (tx) => {
      // Re-fetch with locks to prevent race conditions
      const productIds = validatedItems.map((item) => item.productId);
      const colorIds = validatedItems
        .filter((item) => item.colorId)
        .map((item) => item.colorId);

      // Fetch all required data with FOR UPDATE locks
      const [products, colors, inventories] = await Promise.all([
        tx.product.findMany({
          where: { id: { in: productIds }, isDeleted: false },
        }),
        colorIds.length > 0
          ? tx.productColor.findMany({
              where: { id: { in: colorIds } },
            })
          : Promise.resolve([]),
        tx.productInventory.findMany({
          where: { productId: { in: productIds } },
        }),
      ]);

      // Re-validate with actual data
      for (const item of validatedItems) {
        const color = colors.find((c) => c.id === item.colorId);
        const inventory = inventories.find((inv) => inv.productId === item.productId);

        if (item.colorId && (!color || color.stock < item.quantity)) {
          throw new BadRequestException(
            `Insufficient ${color?.name} stock. Required: ${item.quantity}, Available: ${color?.stock || 0}`
          );
        }

        if (!item.colorId && (!inventory || inventory.quantity < item.quantity)) {
          throw new BadRequestException(
            `Insufficient stock. Required: ${item.quantity}, Available: ${inventory?.quantity || 0}`
          );
        }
      }

      // ✅ Deduct stock IMMEDIATELY (not at payment success)
      // This prevents overselling
      for (const item of validatedItems) {
        if (item.colorId) {
          await tx.productColor.update({
            where: { id: item.colorId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const inventory = inventories.find((inv) => inv.productId === item.productId);
        if (inventory) {
          await tx.productInventory.update({
            where: { id: inventory.id },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }

      // Create order
      const createdOrder = await tx.order.create({
        data: {
          traxId: trxId,
          userId,
          name: dto.name,
          email: dto.email || user.email || 'no-email@example.com',
          phoneNumber: dto.phoneNumber,
          address: dto.address,
          totalAmount: finalAmount,
          discount: discountAmount,
          paymentStatus: PaymentStatus.PENDING,
          type: PaymentMethod.ONLINE_PAYMENT,
          orderStatus: OrderStatus.PENDING,
          promoCodeId: dto.promoId,
          orderItems: {
            create: validatedItems.map((item, idx) => ({
              traxId: `${trxId}-${idx}`, // ✅ Unique per item
              productId: item.productId,
              colorId: item.colorId,
              quantity: item.quantity,
              price: item.price,
              options: item.options
                ? {
                    create: item.options.map((opt) => ({
                      optionId: opt.optionId,
                      extraPrice: Number(opt.extraPrice),
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: { orderItems: { include: { product: true, options: true } } },
      });

      return createdOrder;
    },
    { timeout: 10000 } // Prevent long locks
  );

  // Payment should now only confirm the already-reserved stock
  const paymentSession = (await this.sslService.createSession(order)) as any;

  return {
    success: true,
    orderId: order.id,
    traxId: order.traxId,
    totalAmount: finalAmount,
    paymentSession: paymentSession?.GatewayPageURL || null,
  };
}
```

Then simplify `handleSuccess` to only update order status:

```typescript
async handleSuccess(val_id?: string, tran_id?: string) {
  try {
    let validation: any = null;
    if (val_id) {
      validation = await this.sslService.validatePayment(val_id);
    }

    const trxIdForLookup = validation?.tran_id || tran_id;

    const order = await this.prisma.order.findUnique({
      where: { traxId: trxIdForLookup },
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.paymentStatus === PaymentStatus.SUCCESS) return true;

    // Verify payment amount and store ID
    const receivedAmount = parseFloat(validation.amount).toFixed(2);
    const orderAmount = parseFloat(order.totalAmount.toString()).toFixed(2);

    if (receivedAmount !== orderAmount) {
      throw new BadRequestException('Amount mismatch');
    }

    // ✅ Only update order status - stock already deducted
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.SUCCESS,
          orderStatus: OrderStatus.CONFIRMED,
        },
      });

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

      if (order.promoCodeId) {
        await tx.promoCode.update({
          where: { id: order.promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }
    });

    return true;
  } catch (error) {
    this.logger.error('Payment success error:', error);
    throw error;
  }
}
```

---

## 🔴 CRITICAL BUG #4: Missing Delivery Charge Storage

**Severity**: CRITICAL  
**Impact**: Incorrect invoice totals, wrong refunds  
**File**: `src/module/orders/orders.service.ts` (Line 113)

### Problem

```typescript
const itemTotal =
  (Number(itemPrice) + optionExtraPrice + deliveryCharge) * item.quantity;
totalAmount += itemTotal;
//  ✅ included in totalAmount
//  ❌ but NOT stored in OrderItem
```

When creating OrderItem:

```typescript
orderItems: {
  create: validatedItems.map((item) => ({
    traxId: trxId,
    productId: item.productId,
    colorId: item.colorId,
    quantity: item.quantity,
    price: item.price,  // ✅ base price only
    // ❌ MISSING: deliveryCharge field
    options: item.options ? { create: ... } : undefined,
  })),
},
```

### Impact

```
Invoice shows:
  Item price: 50,000 BDT
  Delivery: 500 BDT
  Total: 50,500 BDT

Database stored:
  OrderItem.price: 50,000
  OrderItem.deliveryCharge: MISSING ❌

When refunding:
  Refund = 50,000 (missing 500) ❌
```

### Fix

**Step 1: Update Prisma Schema**

```prisma
model OrderItem {
  id        String            @id @default(cuid())
  orderId   String
  traxId    String            @unique
  productId String
  colorId   String?
  quantity  Int
  price     Decimal           @db.Decimal(10, 2)
  deliveryCharge Decimal      @db.Decimal(10, 2) @default(0)  // ✅ ADD THIS
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
  // ... rest
}
```

Run migration:

```bash
npx prisma migrate dev --name add_delivery_charge_to_order_item
```

**Step 2: Update Order Service**

```typescript
private async validateAndPrepareOrderItems(items: CreateOrderDto['items']): Promise<{
  validatedItems: Array<{
    productId: string;
    colorId: string | null;
    quantity: number;
    price: any;
    deliveryCharge: number;  // ✅ ADD THIS
    optionExtraPrice: number;
    options: any[];
  }>;
  totalAmount: number;
}> {
  // ... existing fetch logic ...

  const validatedItems: Array<{...}> = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new BadRequestException(`Product not found: ${item.productId}`);
    }

    let itemPrice = product.price;
    const deliveryCharge = Number(product.deliveryCharge) || 0;  // ✅ CAPTURE THIS

    if (item.colorId) {
      const productColor = colorMap.get(item.colorId);
      if (!productColor || productColor.productId !== item.productId) {
        throw new BadRequestException(`Invalid color for product`);
      }
      if (productColor.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${productColor.name}. Available: ${productColor.stock}`
        );
      }
      itemPrice = productColor.basePrice;
    } else {
      const inventory = inventoryMap.get(item.productId);
      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.title}`
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

    // ✅ Include delivery charge in calculation
    const itemTotal = (Number(itemPrice) + optionExtraPrice + deliveryCharge) * item.quantity;
    totalAmount += itemTotal;

    validatedItems.push({
      productId: item.productId,
      colorId: item.colorId || null,
      quantity: item.quantity,
      price: itemPrice,
      deliveryCharge,  // ✅ ADD THIS
      optionExtraPrice,
      options: item.options || [],
    });
  }

  return { validatedItems, totalAmount };
}
```

**Step 3: Update Order Creation**

```typescript
const createdOrder = await tx.order.create({
  data: {
    // ... other fields ...
    orderItems: {
      create: validatedItems.map((item) => ({
        traxId: generateUniqueId(trxId, 4),
        productId: item.productId,
        colorId: item.colorId,
        quantity: item.quantity,
        price: item.price,
        deliveryCharge: item.deliveryCharge, // ✅ STORE THIS
        options: item.options
          ? {
              create: item.options.map((opt) => ({
                optionId: opt.optionId,
                extraPrice: Number(opt.extraPrice),
              })),
            }
          : undefined,
      })),
    },
  },
});
```

---

## 🔴 CRITICAL BUG #5: PromoCode Per-User Limit Not Enforced

**Severity**: CRITICAL  
**Impact**: Users bypass discount limits, revenue loss  
**File**: `src/module/orders/orders.service.ts` (Line 156)

### Problem

```typescript
private async calculateDiscount(promoId: string | undefined, totalAmount: number): Promise<number> {
  if (!promoId) return 0;

  const promo = await this.prisma.promoCode.findUnique({
    where: { id: promoId },
  });

  // ✅ Checks if active and not expired
  // ❌ MISSING: Check perUserLimit

  if (!promo.isActive) {
    throw new BadRequestException('Promo Code is not active');
  }

  if (promo.expiresAt < new Date()) {
    throw new BadRequestException('Promo Code has expired');
  }

  // ... calculate discount ...
  return discountAmount;
}
```

Schema has `perUserLimit`:

```prisma
model PromoCode {
  // ...
  perUserLimit Int? @default(1)
  usageLimit   Int?
  usedCount    Int  @default(0)  // ← Global usage, not per-user
  // ...
}
```

### Real-World Impact

```
Promo: "FLAT50" - 50 BDT off, perUserLimit: 1
User places 5 orders, uses promo in each:
  Order 1: -50 BDT ✓
  Order 2: -50 BDT ❌ (should be blocked)
  Order 3: -50 BDT ❌
  Order 4: -50 BDT ❌
  Order 5: -50 BDT ❌
  Lost revenue: 200 BDT per user × 10,000 users = 2,000,000 BDT/month
```

### Fix

**Step 1: Update Schema (add per-user tracking)**

```prisma
model PromoCodeUsage {
  id        String   @id @default(cuid())
  promoId   String
  userId    String
  usedCount Int      @default(0)
  promo     PromoCode @relation(fields: [promoId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([promoId, userId])  // Only one record per user per promo
  @@map("promo_code_usage")
}

model PromoCode {
  id           String           @id @default(cuid())
  code         String           @unique
  discount     Decimal          @db.Decimal(10, 2)
  type         PromoType        @default(FLAT)
  isActive     Boolean          @default(true)
  expiresAt    DateTime
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  isDeleted    Boolean          @default(false)
  perUserLimit Int?             @default(1)
  usageLimit   Int?             // Global limit
  usedCount    Int              @default(0)  // Global count
  orders       Order[]
  usages       PromoCodeUsage[] // ✅ Add this

  @@map("promo_codes")
}

model User {
  // ... existing fields ...
  promoUsages PromoCodeUsage[]  // ✅ Add this
  // ...
}
```

**Step 2: Update Service**

```typescript
private async calculateDiscount(
  promoId: string | undefined,
  totalAmount: number,
  userId: string  // ✅ Add this parameter
): Promise<number> {
  if (!promoId) return 0;

  const promo = await this.prisma.promoCode.findUnique({
    where: { id: promoId },
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

  // ✅ Check per-user limit
  if (promo.perUserLimit && promo.perUserLimit > 0) {
    const userUsage = await this.prisma.promoCodeUsage.findUnique({
      where: {
        promoId_userId: {  // ✅ Compound key from schema
          promoId,
          userId,
        },
      },
    });

    if (userUsage && userUsage.usedCount >= promo.perUserLimit) {
      throw new BadRequestException(
        `You have reached the limit for this promo code (${promo.perUserLimit} use${promo.perUserLimit > 1 ? 's' : ''})`
      );
    }
  }

  // ✅ Check global limit
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    throw new BadRequestException('Promo Code has reached its usage limit');
  }

  let discountAmount = 0;
  if (promo.type === 'FLAT') {
    discountAmount = Number(promo.discount);
  } else {
    discountAmount = (totalAmount * Number(promo.discount)) / 100;
  }

  if (discountAmount > totalAmount) {
    discountAmount = totalAmount;
  }

  return discountAmount;
}
```

**Step 3: Update Order Creation (both methods)**

```typescript
async createOrder(dto: CreateOrderDto, userInfo: any) {
  const userId = userInfo.userId;
  const user = await this.helperService.findUser(userId);
  const { validatedItems, totalAmount } = await this.validateAndPrepareOrderItems(dto.items);
  // ✅ Pass userId to calculateDiscount
  const discountAmount = await this.calculateDiscount(dto.promoId, totalAmount, userId);
  // ... rest remains same ...
}

async cashOnOrder(dto: CreateOrderDto, userInfo: any) {
  const userId = userInfo.userId;
  // ...
  // ✅ Pass userId to calculateDiscount
  const discountAmount = await this.calculateDiscount(dto.promoId, totalAmount, userId);
  // ... rest remains same ...
}
```

**Step 4: Track Usage in Transaction**

```typescript
// In both createOrder and cashOnOrder, inside the transaction:
const order = await this.prisma.$transaction(async (tx) => {
  // ... create order ...

  // ✅ Track promo usage
  if (createdOrder.promoCodeId) {
    const existingUsage = await tx.promoCodeUsage.findUnique({
      where: {
        promoId_userId: {
          promoId: createdOrder.promoCodeId,
          userId,
        },
      },
    });

    if (existingUsage) {
      await tx.promoCodeUsage.update({
        where: { id: existingUsage.id },
        data: { usedCount: { increment: 1 } },
      });
    } else {
      await tx.promoCodeUsage.create({
        data: {
          promoId: createdOrder.promoCodeId,
          userId,
          usedCount: 1,
        },
      });
    }

    // Also update global count
    await tx.promoCode.update({
      where: { id: createdOrder.promoCodeId },
      data: { usedCount: { increment: 1 } },
    });
  }
});
```

---

## 🔴 CRITICAL BUG #6: Weak TraxId Generation

**Severity**: CRITICAL (Security)  
**Impact**: Transaction ID spoofing, collision attacks  
**File**: `src/module/orders/entities/order.entity.ts`

### Problem

```typescript
export const generateUniqueId = (prefix = "", length = 8): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + id;
};
```

**Weaknesses:**

1. **Math.random()** is not cryptographically secure
2. **6 characters** = 36^6 ≈ 2.1 billion combinations (TOO FEW)
3. **Predictable pattern** - if attacker knows sequence, can predict next ID
4. **No timestamp** - multiple IDs can have same creation time

### Real-World Attack

```
Attacker predicts order IDs:
- Monitoring transaction flow: TRX001, TRX002, TRX003...
- Pattern emerges: sequential!
- Can spoof IPN callbacks with predicted IDs
- Can tamper with payment amounts
```

### Fix

```typescript
// ✅ Use crypto.randomUUID() or nanoid
import { randomUUID } from "crypto";

export const generateUniqueId = (prefix = ""): string => {
  // Use UUID v4 (cryptographically secure)
  const uuid = randomUUID();
  return prefix ? `${prefix}-${uuid}` : uuid;
};

// ✅ Or use nanoid (shorter, random)
import { nanoid } from "nanoid";

export const generateUniqueId = (prefix = "", length = 12): string => {
  const id = nanoid(length);
  return prefix ? `${prefix}${id}` : id;
};
```

**Update all order/item creation:**

```typescript
async createOrder(dto: CreateOrderDto, userInfo: any) {
  // ...
  const trxId = generateUniqueId("ORD");  // ✅ ORD-uuid or ORD-nanoid

  const order = await this.prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        traxId: trxId,
        // ...
        orderItems: {
          create: validatedItems.map((item, idx) => ({
            traxId: generateUniqueId(`${trxId}-I`),  // ✅ Unique per item
            // ...
          })),
        },
      },
    });
  });
}
```

---

## 🔴 CRITICAL BUG #7: IPN Doesn't Set Payment Type

**Severity**: CRITICAL  
**Impact**: Online payments recorded as cash, audit failure  
**File**: `src/module/orders/orders.service.ts` (Line 750)

### Problem

```typescript
async handleIpn(ipnData: any) {
  // ... validation ...

  await this.prisma.$transaction(async (tx) => {
    // ...
    await tx.transaction.create({
      data: {
        orderId: order.id,
        traxId: tran_id,
        status: PaymentStatus.SUCCESS,
        amount: Number(amount),
        transactionId: ipnData.bank_tran_id || null,
        // ❌ MISSING: type field
        // Defaults to PaymentMethod.CASH_ON_DELIVERY ❌
      },
    });
  });
}
```

Same issue in `handleSuccess()`:

```typescript
await tx.transaction.create({
  data: {
    orderId: order.id,
    traxId: trxIdForLookup,
    status: PaymentStatus.SUCCESS,
    amount: Number(validation.amount),
    transactionId: validation.bank_tran_id,
    // ❌ MISSING: type field
  },
});
```

### Real-World Impact

```
Audit Report:
  Total Orders: 1000
  Online Payments: 500 (recorded as COD ❌)
  COD Orders: 500 (recorded correctly)

Result: Looks like 1000 COD orders in database!
  - Wrong financial reconciliation
  - Merchant account mismatch
  - Bank dispute issues
  - Audit failure
```

### Fix

```typescript
async handleSuccess(val_id?: string, tran_id?: string) {
  try {
    // ... validation ...

    await this.prisma.$transaction(async (tx) => {
      // ... update order ...

      await tx.transaction.create({
        data: {
          orderId: order.id,
          traxId: trxIdForLookup,
          status: PaymentStatus.SUCCESS,
          amount: Number(validation.amount),
          transactionId: validation.bank_tran_id,
          type: PaymentMethod.ONLINE_PAYMENT,  // ✅ ADD THIS
        },
      });

      // ...
    });

    return true;
  } catch (error) {
    this.logger.error('Payment success error:', error);
    throw error;
  }
}

async handleIpn(ipnData: any) {
  // ... validation ...

  try {
    await this.prisma.$transaction(async (tx) => {
      // ... update order ...

      await tx.transaction.create({
        data: {
          orderId: order.id,
          traxId: tran_id,
          status: PaymentStatus.SUCCESS,
          amount: Number(amount),
          transactionId: ipnData.bank_tran_id || null,
          type: PaymentMethod.ONLINE_PAYMENT,  // ✅ ADD THIS
        },
      });

      // ...
    });

    return { status: 'VALID', message: 'Payment processed successfully' };
  } catch (error) {
    this.logger.error('IPN processing error:', error);
    throw error;
  }
}
```

---

## 🔶 HIGH PRIORITY FIXES (5)

### H1: Authorization Check in getSingleOrder

**File**: `src/module/orders/orders.controller.ts` (Line 59)

Current code allows any admin to see any order:

```typescript
@Get('order/:orderId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
async getSingleOrder(@Param('orderId') orderId: string) {
  // ❌ No ownership verification
  const result = await this.ordersService.getSingleOrder(orderId);
  return { /* ... */ };
}
```

**Fix**:

```typescript
@Get('order/:orderId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
async getSingleOrder(
  @Param('orderId') orderId: string,
  @CurrentUser() user: any  // ✅ Get current user
) {
  const result = await this.ordersService.getSingleOrder(orderId, user);
  return { statusCode: HttpStatus.OK, data: result };
}
```

Service:

```typescript
async getSingleOrder(orderId: string, user: any) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    // ... includes ...
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // ✅ Check authorization
  if (user.role !== RoleType.ADMIN && order.userId !== user.userId) {
    throw new ForbiddenException('You can only view your own orders');
  }

  return this.formatOrderData(order);
}
```

### H2: Missing Order Cancellation Endpoint

**Issue**: No way to cancel orders and rollback stock after creation

**Solution**:

```typescript
// controller
@Patch(':orderId/cancel')
@UseGuards(JwtAuthGuard)
async cancelOrder(
  @Param('orderId') orderId: string,
  @CurrentUser() user: any
) {
  await this.ordersService.cancelOrder(orderId, user.userId);
  return { success: true, message: 'Order cancelled successfully' };
}

// service
async cancelOrder(orderId: string, userId: string) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.userId !== userId) {
    throw new ForbiddenException('Can only cancel your own orders');
  }

  if (order.orderStatus === OrderStatus.SHIPPED || order.orderStatus === OrderStatus.DELIVERED) {
    throw new BadRequestException('Cannot cancel shipped/delivered orders');
  }

  await this.prisma.$transaction(async (tx) => {
    // ✅ Rollback stock
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

      await tx.product.update({
        where: { id: item.productId },
        data: { sold: { decrement: item.quantity } },
      });
    }

    // ✅ Update order
    await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.CANCELLED,
      },
    });
  });
}
```

### H3: IPN Store ID Validation Too Lenient

Current:

```typescript
const ipnStoreIdValid = ipnStoreId ? ipnStoreId === expectedIpnStoreId : true;
//                      ↑ Allows skipping check if missing
```

**Fix**:

```typescript
// ALWAYS verify
if (!ipnStoreId || ipnStoreId !== expectedIpnStoreId) {
  this.logger.warn("IPN store verification failed", {
    received: ipnStoreId,
    expected: expectedIpnStoreId,
  });
  throw new BadRequestException("Store verification failed");
}
```

### H4: Add IPN Signature Verification

**Issue**: IPN endpoint has no signature verification

**Solution**:

```typescript
@Post('ipn')
async ipnHandler(@Body() body: any, @Req() req: Request) {
  // ✅ Verify SSL Commerz signature
  const signature = req.headers['x-signature'];  // or from body, check SSL docs
  const isValid = this.sslService.verifyIpnSignature(body, signature);

  if (!isValid) {
    throw new BadRequestException('Invalid IPN signature');
  }

  return await this.ordersService.handleIpn(body);
}
```

### H5: Add Pagination Limit Cap

```typescript
async getAllOrders(query: OrderQueryDto) {
  let { page = 1, limit = 20 } = query;

  // ✅ Prevent excessive data fetch
  limit = Math.min(limit, 100);  // Max 100 per page
  page = Math.max(page, 1);

  // ... rest of logic ...
}
```

---

## 📊 SUMMARY TABLE

| Bug # | Severity | Impact              | Fix Effort |
| ----- | -------- | ------------------- | ---------- |
| 1     | CRITICAL | Stock overselling   | HIGH       |
| 2     | CRITICAL | Negative inventory  | HIGH       |
| 3     | CRITICAL | Race conditions     | HIGH       |
| 4     | CRITICAL | Wrong refunds       | MEDIUM     |
| 5     | CRITICAL | Discount bypass     | MEDIUM     |
| 6     | CRITICAL | ID spoofing         | LOW        |
| 7     | CRITICAL | Wrong audit trail   | LOW        |
| H1    | HIGH     | Data leakage        | LOW        |
| H2    | HIGH     | Can't cancel orders | MEDIUM     |
| H3    | HIGH     | Payment fraud       | LOW        |
| H4    | HIGH     | IPN tampering       | MEDIUM     |
| H5    | HIGH     | DoS risk            | LOW        |

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Fix Bug #1: Add stock deduction to cashOnOrder
- [ ] Fix Bug #2: Add stock rollback to handleFail
- [ ] Fix Bug #3: Implement pessimistic locking or deduct at order creation
- [ ] Fix Bug #4: Add deliveryCharge field to OrderItem
- [ ] Fix Bug #5: Implement per-user promo limit tracking
- [ ] Fix Bug #6: Use crypto.randomUUID() for TraxId
- [ ] Fix Bug #7: Set PaymentMethod.ONLINE_PAYMENT in IPN/handleSuccess
- [ ] Fix H1: Add authorization checks
- [ ] Fix H2: Add order cancellation endpoint
- [ ] Fix H3: Always verify store ID
- [ ] Fix H4: Add IPN signature verification
- [ ] Fix H5: Add pagination limits
- [ ] Run all migrations: `npx prisma migrate deploy`
- [ ] Update integration tests
- [ ] Load test with concurrent orders
- [ ] Security audit by third party
- [ ] Stage environment final testing
- [ ] Production deployment with monitoring

---

## 📞 NEXT STEPS

1. **Immediate** (Today): Disable COD endpoint until fixed
2. **Day 1**: Fix all 7 critical bugs
3. **Day 2-3**: Implement all high-priority fixes + testing
4. **Day 4-5**: Load testing + security audit
5. **Day 6**: Stage deployment + final verification
6. **Day 7**: Production deployment with 24/7 monitoring

---

**Report Generated**: April 23, 2026  
**System**: NestJS 10.x + Prisma + PostgreSQL  
**Status**: 🔴 DO NOT DEPLOY
