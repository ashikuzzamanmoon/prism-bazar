# 05. Database Schema & API Contracts

> **Immutable Contract:** Never alter column names, field types, or endpoint paths on the fly. Update this file FIRST, then migrate code.
> **Conversion Strategy:** Existing Prisma schema models are retained and adapted. Electronics-specific fields are repurposed for organic food & education products.

---

## 1. Schema Adaptation Summary (OneTech → Prism Bazar)

### Models Retained As-Is (No Changes)
- `User`, `Otp`, `Role`, `UserRole` — Auth system unchanged.
- `Order`, `OrderItem`, `OrderItemOption`, `Transaction` — Order flow unchanged.
- `PromoCode` — Promo system unchanged.
- `Banner` — Homepage banner system unchanged.
- `Content` — CMS pages unchanged.

### Models Adapted (Field Repurposing)
| Model | Old Purpose (OneTech) | New Purpose (Prism Bazar) | Changes |
| :--- | :--- | :--- | :--- |
| `Product` | Electronics gadgets | Organic food items / Books / Sheets | Repurpose `condition` → product freshness; add `expiryDate`, `ingredients`, `nutritionInfo` fields |
| `ProductColor` | Phone/gadget colors | Weight/quantity variants (250g, 500g, 1kg) | Rename concept: "color" → "variant"; `name` stores variant label |
| `ProductOptionGroup` | RAM, Storage specs | Book: Author, Class, Subject; Food: Origin, Certification | Reuse as flexible attribute groups |
| `ProductOption` | 8GB, 128GB values | Author name, Class 9, HSC etc. | Reuse as attribute values |
| `ProductFeature` | Tech specifications | Ingredients, Nutrition facts, Publisher info | Reuse `FeatureType` for different product types |
| `ProductTypeEntity` | Electronics type categories | `ORGANIC_FOOD`, `EDUCATION_MATERIAL`, `GENERAL` | Update enum values |
| `Category` | Electronics categories | Food categories (মধু, ঘি, তেল...) & Education (বই, শিট...) | Data-level change only |
| `Collection` | Tech collections | "জনপ্রিয় অর্গানিক", "HSC শিট", "রমজান স্পেশাল" | Data-level change only |

### New Models to Add
| Model | Purpose |
| :--- | :--- |
| `DeliveryZone` | সিরাজগঞ্জ-কাজিপুর ডেলিভারি এরিয়া ও চার্জ কনফিগারেশন |
| `DigitalFile` | ডিজিটাল ডাউনলোড ফাইল (PDF) — Product-এর সাথে সম্পর্কিত |

---

## 2. New Database Models (Prisma Schema)

### DeliveryZone
```prisma
model DeliveryZone {
  id              String   @id @default(cuid())
  name            String                          // e.g. "সিরাজগঞ্জ সদর", "কাজিপুর"
  area            String?                         // sub-area or union
  deliveryCharge  Float                           // in BDT
  estimatedTime   String?                         // e.g. "সেম ডে", "১-২ দিন"
  isActive        Boolean  @default(true)
  isDelete        Boolean  @default(false)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  orders          Order[]

  @@map("delivery_zones")
}
```

### DigitalFile
```prisma
model DigitalFile {
  id          String   @id @default(cuid())
  productId   String
  fileName    String                              // original file name
  filePath    String                              // server storage path (not public)
  fileSize    Int                                 // in bytes
  mimeType    String   @default("application/pdf")
  createdAt   DateTime @default(now())
  product     Product  @relation(fields: [productId], references: [id])

  @@map("digital_files")
}
```

### Product Model Additions
```prisma
// Add to existing Product model:
  expiryDate     DateTime?                        // অর্গানিক পণ্যের মেয়াদ
  ingredients    String?                           // উপাদান তালিকা
  nutritionInfo  String?                           // পুষ্টিগুণ তথ্য
  isDigital      Boolean   @default(false)         // ডিজিটাল ডাউনলোড প্রোডাক্ট কি না
  author         String?                           // বইয়ের লেখক
  publisher      String?                           // প্রকাশক
  digitalFiles   DigitalFile[]
```

### Order Model Addition
```prisma
// Add to existing Order model:
  deliveryZoneId  String?
  deliveryZone    DeliveryZone? @relation(fields: [deliveryZoneId], references: [id])
  deliveryCharge  Float         @default(0)
```

### Updated Enums
```prisma
enum ProductType {
  ORGANIC_FOOD
  EDUCATION_MATERIAL
  GENERAL
}

enum ProductCondition {
  FRESH           // তাজা
  PACKAGED        // প্যাকেজড
  HANDMADE        // হাতে তৈরি
  PRINTED         // প্রিন্টেড (বই/শিট)
  DIGITAL         // ডিজিটাল (PDF)
}

// PaymentMethod — Add new values:
enum PaymentMethod {
  CASH_ON_DELIVERY
  BKASH_MANUAL
  NAGAD_MANUAL
  ONLINE           // ভবিষ্যতে SSLCommerz এর জন্য
}
```

---

## 3. Key API Endpoint Contracts

### Delivery Zones
- `GET /api/v1/delivery-zones` — Public: সকল অ্যাক্টিভ ডেলিভারি জোন লিস্ট।
- `POST /api/v1/delivery-zones` — Admin: নতুন জোন তৈরি।
- `PATCH /api/v1/delivery-zones/:id` — Admin: জোন আপডেট।
- `DELETE /api/v1/delivery-zones/:id` — Admin: জোন সফট ডিলিট।

### Digital Downloads
- `GET /api/v1/downloads/:productId` — Authenticated user: পেমেন্ট ভেরিফাইড হলে ফাইল ডাউনলোড URL প্রদান।
- `POST /api/v1/admin/digital-files/:productId` — Admin: ডিজিটাল ফাইল আপলোড।

### Orders (Modified)
- `POST /api/v1/orders/cod` — COD অর্ডার (deliveryZoneId বাধ্যতামূলক ফিজিক্যাল পণ্যের জন্য)।
- `POST /api/v1/orders/manual-payment` — বিকাশ/নগদ ম্যানুয়াল পেমেন্ট (transactionId সহ)।
- `PATCH /api/v1/admin/orders/:id/verify-payment` — Admin: ম্যানুয়াল পেমেন্ট ভেরিফিকেশন।

---

## 4. Shared Data Types (TypeScript)
```ts
export type ProductType = "ORGANIC_FOOD" | "EDUCATION_MATERIAL" | "GENERAL";
export type ProductCondition = "FRESH" | "PACKAGED" | "HANDMADE" | "PRINTED" | "DIGITAL";
export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH_MANUAL" | "NAGAD_MANUAL" | "ONLINE";

export interface DeliveryZoneRecord {
  id: string;
  name: string;
  area: string | null;
  deliveryCharge: number;
  estimatedTime: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface DigitalFileRecord {
  id: string;
  productId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
```
