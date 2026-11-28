// Root Interface
export interface Order {
    id: string;
    traxId: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
    paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | string;
    invoiceDate: string;

    customer: Customer;
    items: OrderItem[];
    summary: OrderSummary;
    payment: Payment;
    timestamps: Timestamps;
}

// Customer
export interface Customer {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
}

// Order Item
export interface OrderItem {
    id: string;
    product: Product;
    color: ProductColor;
    quantity: number;
    unitPrice: number;
    options: ProductOption[];
    itemTotal: number;
}

// Product
export interface Product {
    id: string;
    title: string;
    slug: string;
}

// Color
export interface ProductColor {
    id: string;
    name: string;
    hexCode: string;
}

// Option
export interface ProductOption {
    id: string;
    value: string;
    extraPrice: number;
    group: OptionGroup;
}

// Option Group
export interface OptionGroup {
    id: string;
    title: string;
    type: "STORAGE" | "COLOR" | "SIZE" | string;
}

// Summary
export interface OrderSummary {
    subtotal: number;
    discount: Discount;
    total: number;
}

// Discount
export interface Discount {
    amount: number;
    code: string | null;
    type: string | null;
}

// Payment
export interface Payment {
    method: "ONLINE_PAYMENT" | "COD" | string;
    status: "PENDING" | "SUCCESS" | "FAILED" | string;
    transaction: Transaction;
}

// Transaction
export interface Transaction {
    id: string;
    transactionId: string;
    amount: number;
    type: string;
    status: string;
    date: string;
}

// Timestamps
export interface Timestamps {
    createdAt: string;
    updatedAt: string;
}