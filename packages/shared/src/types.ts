export type ProductType =
  | "ORGANIC_FOOD"
  | "EDUCATION_MATERIAL"
  | "GENERAL"
  | "LAPTOP"
  | "ACCESSORY";

export type ProductCondition =
  | "FRESH"
  | "PACKAGED"
  | "HANDMADE"
  | "PRINTED"
  | "DIGITAL"
  | "BRAND_NEW"
  | "PRE_OWNED";

export type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "BKASH_MANUAL"
  | "NAGAD_MANUAL"
  | "ONLINE_PAYMENT";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export interface DeliveryZoneRecord {
  id: string;
  name: string;
  area: string | null;
  deliveryCharge: number;
  estimatedTime: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DigitalFileRecord {
  id: string;
  productId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt?: string | Date;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "২৫০ গ্রাম", "৫০০ গ্রাম", "১ কেজি"
  stock: number;
  price?: number;
}

export interface ProductRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  basePrice: number;
  discount: number;
  ratings: number;
  reviewsCount: number;
  sold: number;
  condition: ProductCondition;
  type: ProductType;
  isPublish: boolean;
  expiryDate?: string | null;
  ingredients?: string | null;
  nutritionInfo?: string | null;
  isDigital?: boolean;
  author?: string | null;
  publisher?: string | null;
  deliveryCharge?: number | null;
  brandId?: string;
  images?: string[];
  colors?: ProductVariant[];
  digitalFiles?: DigitalFileRecord[];
}

export interface CreateOrderDto {
  name: string;
  phoneNumber: string;
  email?: string;
  address: string;
  deliveryZoneId?: string;
  type?: PaymentMethod;
  promoId?: string;
  transactionId?: string; // For manual bKash/Nagad
  items: Array<{
    productId: string;
    quantity: number;
    colorId?: string; // used for variant
    options?: Array<{
      optionId: string;
      value: string;
    }>;
  }>;
}
