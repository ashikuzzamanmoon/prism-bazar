export type ProductType = "ORGANIC_FOOD" | "EDUCATION_MATERIAL" | "GENERAL";
export type ProductCondition = "FRESH" | "PACKAGED" | "HANDMADE" | "PRINTED" | "DIGITAL";
export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH_MANUAL" | "NAGAD_MANUAL" | "ONLINE";
export type OrderStatus = "PENDING" | "PAYMENT_VERIFIED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
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
//# sourceMappingURL=types.d.ts.map