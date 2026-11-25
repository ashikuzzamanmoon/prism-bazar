# eCommerce Payment System - ADDITIONAL FIXES & BEST PRACTICES

## 🔧 Additional High-Priority Fixes

### Add Soft Delete to Order Models

**Step 1: Update Schema**

```prisma
model Order {
  id            String        @id @default(cuid())
  traxId        String        @unique
  userId        String
  // ... other fields ...
  isDeleted     Boolean       @default(false)  // ✅ ADD THIS
  deletedAt     DateTime?                      // ✅ When deleted
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  // ... relations ...

  @@index([userId, isDeleted])  // ✅ Common filter
  @@index([isDeleted])
}

model OrderItem {
  id        String            @id @default(cuid())
  // ... fields ...
  isDeleted Boolean           @default(false)  // ✅ ADD THIS
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
  // ... relations ...
}
```

**Step 2: Always Filter Deleted**

```typescript
async getMyOrders(userId: string) {
  const orders = await this.prisma.order.findMany({
    where: {
      userId,
      isDeleted: false,  // ✅ Always add this
    },
    // ... rest ...
  });
}

async getSingleOrder(orderId: string) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        where: { isDeleted: false },  // ✅ Filter items too
      },
    },
  });

  if (!order || order.isDeleted) {
    throw new NotFoundException('Order not found');
  }

  return order;
}
```

---

### Prevent Duplicate OrderItem TraxIds

**Current Bug**: All items in an order get same `traxId`

```typescript
// ❌ WRONG - All items get same traxId
orderItems: {
  create: validatedItems.map((item) => ({
    traxId: trxId,  // ← Same for all items!
    // ...
  })),
},

// ✅ CORRECT - Unique per item
orderItems: {
  create: validatedItems.map((item, index) => ({
    traxId: `${trxId}-${String(index + 1).padStart(2, '0')}`,
    // OR
    traxId: generateUniqueId(`${trxId}-I`),
    // ...
  })),
},
```

---

### Ensure Stock Consistency (Inventory vs Color)

**Issue**: Both `ProductInventory.quantity` and `ProductColor.stock` can diverge

**Solution - Option A: Single Source of Truth (Recommended)**

Use only `ProductColor.stock` for color variants, remove global `ProductInventory`:

```prisma
// Remove ProductInventory for color-based products
// For non-color products, use ProductColor as "default" color

model Product {
  // ...
  productColors ProductColor[]  // ✅ All variants here
  productInventories ProductInventory[]  // For non-color products only
}

model ProductColor {
  id         String         @id @default(cuid())
  productId  String
  name       String  // For non-color products, set to "Default"
  stock      Int     @default(0)  // ✅ Source of truth for this variant
  // ...
}
```

When creating order items:

```typescript
// ✅ Check only color stock (unified source)
if (item.colorId) {
  const color = await tx.productColor.findUnique({
    where: { id: item.colorId },
  });

  if (!color || color.stock < item.quantity) {
    throw new BadRequestException("Insufficient stock");
  }

  await tx.productColor.update({
    where: { id: item.colorId },
    data: { stock: { decrement: item.quantity } },
  });
} else {
  // For products without color, create/use default color
  const defaultColor = await tx.productColor.findFirst({
    where: { productId: item.productId, name: "Default" },
  });

  if (!defaultColor || defaultColor.stock < item.quantity) {
    throw new BadRequestException("Insufficient stock");
  }

  await tx.productColor.update({
    where: { id: defaultColor.id },
    data: { stock: { decrement: item.quantity } },
  });
}

// Remove ProductInventory updates entirely
```

**Option B: Keep Both (if color is optional per product)**

```typescript
// Always update BOTH in sync
if (item.colorId) {
  // Update color stock
  await tx.productColor.update({
    where: { id: item.colorId },
    data: { stock: { decrement: item.quantity } },
  });
}

// Always update global inventory too
const inventory = await tx.productInventory.findFirst({
  where: { productId: item.productId },
});

if (inventory) {
  await tx.productInventory.update({
    where: { id: inventory.id },
    data: { quantity: { decrement: item.quantity } },
  });
}
```

---

### Add Request Validation DTOs

**File**: `src/module/orders/dto/order-quer-dto.ts`

```typescript
import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
  IsISO8601,
} from "class-validator";
import { Type } from "class-transformer";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "generated/prisma/enums";

export class OrderQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // ✅ Cap at 100
  limit: number = 20;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(OrderStatus, { each: true })
  orderStatus?: OrderStatus[];

  @IsOptional()
  @IsEnum(PaymentStatus, { each: true })
  paymentStatus?: PaymentStatus[];

  @IsOptional()
  @IsEnum(PaymentMethod)
  type?: PaymentMethod;

  @IsOptional()
  @IsString()
  promoCodeId?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsString()
  sort: string = "createdAt";

  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder: "asc" | "desc" = "desc";
}
```

---

### Add Order Status Validation

**Issue**: No validation of status transitions

**Solution**:

```typescript
// Add to OrdersHelperService
validOrderStatusTransitions = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.DELIVERED],  // Terminal
  [OrderStatus.CANCELLED]: [OrderStatus.CANCELLED],  // Terminal
};

isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return this.validOrderStatusTransitions[from]?.includes(to) ?? false;
}

// Use in service
async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!this.helperService.isValidStatusTransition(order.orderStatus, newStatus)) {
    throw new BadRequestException(
      `Cannot transition from ${order.orderStatus} to ${newStatus}`
    );
  }

  // ... update order ...
}
```

---

### Add Payment Amount Verification Middleware

**File**: `src/module/orders/interceptors/payment-verification.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class PaymentVerificationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: any): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // For payment callbacks
    if (request.path.includes("/payment/")) {
      const { amount, tran_id } = request.body;

      // ✅ Verify amount is numeric and positive
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new BadRequestException("Invalid payment amount");
      }

      // ✅ Verify transaction ID exists
      if (!tran_id || typeof tran_id !== "string") {
        throw new BadRequestException("Invalid transaction ID");
      }
    }

    return next.handle();
  }
}

// Register in OrdersModule
@Module({
  controllers: [PaymentController, OrdersController],
  providers: [
    OrdersService,
    SslService,
    OrdersHelperService,
    { provide: APP_INTERCEPTOR, useClass: PaymentVerificationInterceptor },
  ],
})
export class OrdersModule {}
```

---

## 🛡️ Security Hardening

### 1. Add Rate Limiting

```typescript
// main.ts
import { rateLimit } from "express-rate-limit";

const app = await NestFactory.create(AppModule);

// Rate limit payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many payment requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1/payment", paymentLimiter);

// Stricter limit for IPN (should be called 1-2 times per order)
const ipnLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 IPN callbacks per minute per IP
  keyGenerator: (req) => {
    // Rate limit per order, not per IP
    return req.body?.tran_id || req.ip;
  },
});

app.use("/api/v1/payment/ipn", ipnLimiter);
```

### 2. Add IPN Signature Verification

```typescript
// src/module/orders/order.payment.service.ts

import * as crypto from "crypto";

export class SslService {
  // Verify IPN signature (check SSL Commerz documentation for exact algorithm)
  verifyIpnSignature(data: any): boolean {
    try {
      // SSL Commerz usually uses MD5 or SHA256
      // Example (adjust based on actual SSL docs):
      const signature = data.risk_level || ""; // SSL includes this in signed fields

      // Build string from specific fields in order
      const fields = [
        data.store_amount || "",
        data.store_id || "",
        data.status || "",
        data.currency || "",
        data.amount || "",
        data.tran_id || "",
      ];

      const hash = crypto
        .createHash("md5")
        .update(fields.join(""))
        .digest("hex");

      // ❌ This is pseudocode - CHECK SSL COMMERZ DOCS FOR ACTUAL ALGORITHM
      return signature === hash;
    } catch (error) {
      this.logger.error("IPN signature verification failed", error);
      return false;
    }
  }

  // Log IPN for debugging
  logIpnRequest(data: any) {
    this.logger.debug("IPN Request Received", {
      tranId: data.tran_id,
      status: data.status,
      amount: data.amount,
      storeId: data.store_id,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 3. Add HTTPS and HSTS

```typescript
// main.ts
const app = await NestFactory.create(AppModule);

// Enforce HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
        },
      },
    }),
  );
}

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    res.redirect(`https://${req.get("host")}${req.url}`);
  } else {
    next();
  }
});
```

---

## 📊 Monitoring & Logging

### Add Transaction Audit Log

```typescript
model TransactionAuditLog {
  id        String   @id @default(cuid())
  orderId   String
  action    String   // "CREATED", "VALIDATED", "FAILED", "REFUNDED"
  status    String
  amount    Decimal  @db.Decimal(10, 2)
  metadata  Json?    // Additional data
  createdAt DateTime @default(now())
  order     Order    @relation(fields: [orderId], references: [id])

  @@index([orderId])
  @@index([createdAt])
}

// In service
await tx.transactionAuditLog.create({
  data: {
    orderId: order.id,
    action: 'PAYMENT_SUCCESS',
    status: PaymentStatus.SUCCESS,
    amount: order.totalAmount,
    metadata: {
      bankTransId: validation.bank_tran_id,
      processor: 'SSL_COMMERZ',
    },
  },
});
```

### Add Stock Audit Trail

```typescript
model StockAuditLog {
  id          String   @id @default(cuid())
  productId   String
  colorId     String?
  orderId     String?
  action      String   // "DEDUCTED", "RESTORED", "REFUNDED"
  quantity    Int
  beforeStock Int
  afterStock  Int
  reason      String?  // "ORDER_CREATED", "PAYMENT_FAILED", "ORDER_CANCELLED"
  createdAt   DateTime @default(now())

  @@index([productId, createdAt])
  @@index([orderId])
}

// In service
await tx.stockAuditLog.create({
  data: {
    productId: item.productId,
    colorId: item.colorId,
    orderId: order.id,
    action: 'DEDUCTED',
    quantity: item.quantity,
    beforeStock: colorStock.stock,
    afterStock: colorStock.stock - item.quantity,
    reason: 'PAYMENT_SUCCESS',
  },
});
```

---

## 🧪 Testing

### Add Integration Tests for Stock Deduction

```typescript
// test/orders.e2e-spec.ts

describe('Orders - Stock Management', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

  beforeAll(async () => {
    // Setup...
  });

  it('should deduct stock on COD order', async () => {
    // Create product with 10 units
    const product = await prisma.product.create({
      data: {
        title: 'Test Product',
        // ... other fields ...
      },
    });

    const inventory = await prisma.productInventory.create({
      data: {
        productId: product.id,
        quantity: 10,
      },
    });

    // Place COD order for 5 units
    const response = await request(app.getHttpServer())
      .post('/api/v1/orders/cash-on-delivery')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 5 }],
        name: 'Test User',
        phoneNumber: '01700000000',
        address: 'Test Address',
      });

    expect(response.status).toBe(200);

    // Verify stock was deducted
    const updatedInventory = await prisma.productInventory.findUnique({
      where: { id: inventory.id },
    });

    expect(updatedInventory.quantity).toBe(5);  // ✅ 10 - 5
  });

  it('should prevent overselling', async () => {
    const product = await prisma.product.create({
      data: { title: 'Limited Stock', /* ... */ },
    });

    await prisma.productInventory.create({
      data: { productId: product.id, quantity: 5 },
    });

    // First order for 5 units
    const order1 = await request(app.getHttpServer())
      .post('/api/v1/orders/cash-on-delivery')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 5 }],
        /* ... */
      });

    expect(order1.status).toBe(200);

    // Second order for 1 unit should fail
    const order2 = await request(app.getHttpServer())
      .post('/api/v1/orders/cash-on-delivery')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 1 }],
        /* ... */
      });

    expect(order2.status).toBe(400);  // ✅ Should fail
    expect(order2.body.message).toContain('Insufficient stock');
  });

  it('should rollback stock on payment failure', async () => {
    // Create order with payment
    const order = /* ... create online order ... */;

    // Verify stock was deducted
    let inventory = await prisma.productInventory.findUnique({
      where: { id: /* ... */ },
    });
    const deductedStock = inventory.quantity;

    // Trigger payment failure
    await request(app.getHttpServer())
      .post('/api/v1/payment/fail')
      .send({ tran_id: order.traxId });

    // Verify stock was restored
    inventory = await prisma.productInventory.findUnique({
      where: { id: /* ... */ },
    });

    expect(inventory.quantity).toBe(deductedStock + order.orderItems[0].quantity);  // ✅ Restored
  });
});
```

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] All 7 critical bugs fixed
- [ ] All high-priority fixes implemented
- [ ] Integration tests passing (100% stock tests)
- [ ] Load test: 1000 concurrent orders (no race conditions)
- [ ] Security audit: IPN signature verified, rate limiting enabled
- [ ] Database migrations tested on staging
- [ ] Rollback plan documented

### Staging Validation

- [ ] Create test orders (COD + Online)
- [ ] Verify stock deduction
- [ ] Test payment success/failure/cancel flows
- [ ] Test promo code limits
- [ ] Verify IPN handler with test data
- [ ] Check audit logs
- [ ] Monitor for errors: 24 hours

### Production Deployment

- [ ] Database backup
- [ ] Deploy code + migrations (blue-green)
- [ ] Monitor error rates: 2x24 hours
- [ ] Monitor stock accuracy
- [ ] Monitor payment transaction success rate
- [ ] Customer support on standby

---

## 📞 Support

For questions about these fixes:

1. Check SSL Commerz documentation for IPN signature algorithm
2. Verify database constraints are enforced
3. Test with actual payment gateway (sandbox first)
4. Monitor logs after deployment
