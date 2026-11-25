export interface Product {
  id: string;
  mainImages: string | string[];
  title: string;
  finalPrice: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface IOrder {
  id: string;
  orderId: string;
  trxId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentType: string;
  userId: string;
  promoCodeId: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  transaction?: any;
}
