"use client";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import { useGetSingleOrderQuery } from "@/redux/Api/orderApi";
import { IOrder } from "@/types/order.type";
import { Download, Home, Package } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

const OrderViewPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetSingleOrderQuery(id as string);
  if (isLoading) {
    return <TableSkeleton />;
  }

  const orderData: IOrder = data?.data;
  console.log("order view data", orderData);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `৳ ${price.toLocaleString()}`;
  };

  const getFirstImage = (images: string | string[]) => {
    if (Array.isArray(images)) {
      return images[0] || "/placeholder.svg";
    }
    return images || "/placeholder.svg";
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      PAID: "bg-green-100 text-green-800",
      UNPAID: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold">Invoice</h2>
              <p className="text-orange-100 text-sm mt-1">
                Transaction ID: {orderData.trxId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">#{orderData.orderId}</p>
              <p className="text-orange-100 text-sm mt-1">
                {formatDate(orderData.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                orderData.orderStatus
              )}`}
            >
              Order: {orderData.orderStatus}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                orderData.paymentStatus
              )}`}
            >
              Payment: {orderData.paymentStatus}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
              {orderData.paymentType}
            </span>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2 text-orange-500" />
                Customer Information
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700 font-medium">
                  {orderData.customerName}
                </p>
                <p className="text-gray-600">{orderData.customerPhone}</p>
                <p className="text-gray-600">{orderData.customerAddress}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Order Notes</h3>
              <p className="text-sm text-gray-600 italic">
                {orderData.notes || "No special notes"}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">
              Order Details ({orderData.orderItems.length} items)
            </h3>
            <div className="space-y-4">
              {orderData.orderItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-md overflow-hidden border">
                    <img
                      src={
                        getFirstImage(item.product.mainImages) ||
                        "/placeholder.svg"
                      }
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {item.product.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Qty: {item.quantity}</span>
                      <span>Unit Price: {formatPrice(item.price)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t pt-6 mb-6">
            <div className="max-w-sm ml-auto space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {formatPrice(orderData.subtotal)}
                </span>
              </div>
              {orderData.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">
                    -{formatPrice(orderData.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Shipping:</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    {formatPrice(orderData.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6 pt-4 border-t">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <>
                <Download className="w-4 h-4" />
                Download Invoice
              </>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewPage;
