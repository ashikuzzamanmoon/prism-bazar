export interface IPromoCode {
    id: string;
    code: string;
    discountValue: number;
    usageLimit: number;
    usedCount: number;
    perUserLimit: number;
    startDate: string;   // or Date if you plan to parse it
    endDate: string;     // or Date
    isActive: boolean;
    createdAt: string;   // or Date
    updatedAt: string;   // or Date
}
