/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Search,
  X,
  CheckCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useGetAllOrdersQuery, useVerifyOrderPaymentMutation } from "@/redux/Api/orderApi";
import { toast } from "sonner";
import { TableSkeleton } from "../Common/TableSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { IOrder } from "@/types/order.type";
import { getStatusBg, getStatusColor } from "./order.helper";
import { Input } from "../ui/input";
import { PaginationControl } from "../Common/Pagination";
import { IMeta } from "@/types/metaTypes";

const OrderTable = () => {
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [limit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyOrderPaymentMutation();

  const handleVerifyPayment = async (orderId: string) => {
    try {
      await verifyPayment(orderId).unwrap();
      toast.success("পেমেন্ট সফলভাবে ভেরিফাই করা হয়েছে!");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "পেমেন্ট ভেরিফাই ব্যর্থ হয়েছে!");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const query: Record<string, any> = {
    page: currentPage,
    limit,
  };

  if (searchTerm) {
    query.searchTerm = searchTerm;
  }
  const { data, isLoading } = useGetAllOrdersQuery(query);
  if (isLoading) {
    return <TableSkeleton />;
  }
  const orderData: IOrder[] = data?.data?.data || [];
  const orderMetaData: IMeta = data?.data?.meta || {
    page: 1,
    limit,
    total: 0,
  };

  const totalPages = Math.ceil(orderMetaData.total / orderMetaData.limit);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const toggleRow = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };
  const validOrders = orderData.filter((order) => order.orderItems.length > 0);

  if (validOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No orders found</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2 mb-4"
        >
          <Input
            type="text"
            placeholder="Search by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 shadow-none"
          />
          <Button
            type="submit"
            size="sm"
            className="h-10 cursor-pointer bg-primary text-white hover:bg-primary"
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-9 px-2 cursor-pointer bg-red-100 text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead className="w-6">#</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validOrders.map((order, index) => (
              <React.Fragment key={order.id}>
                <TableRow>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-semibold text-blue-600">
                    {order.orderId}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="text-gray-600">
                    {order.customerPhone}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {order.orderItems.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className=" text-base font-sans font-normal pr-1">
                      ৳
                    </span>
                    {order.totalAmount}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBg(
                        order.orderStatus,
                        "order"
                      )} ${getStatusColor(order.orderStatus, "order")}`}
                    >
                      {order.orderStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBg(
                        order.paymentStatus
                      )} ${getStatusColor(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 relative">
                      <button
                        onClick={() => toggleRow(order.id)}
                        className="inline-flex items-center justify-center p-2 hover:bg-gray-100 rounded"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${
                            expandedRows.has(order.id) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <DropdownMenu
                        open={dropdownOpenId === order.id}
                        onOpenChange={(open) =>
                          setDropdownOpenId(open ? order.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <Link href={`/admin/orders/${order.id}/view`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </Link>
                          {order.paymentStatus === "PENDING" && (
                            <DropdownMenuItem
                              onClick={() => handleVerifyPayment(order.id)}
                              className="text-emerald-600 font-semibold cursor-pointer"
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                              Verify Payment (ভেরিফাই)
                            </DropdownMenuItem>
                          )}
                          {/* <Link href={`/admin/order/${order.id}/update`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Banner
                            </DropdownMenuItem>
                          </Link> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Banner
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>

                {expandedRows.has(order.id) && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={10} className="py-6 pl-8">
                      <div className="space-y-4">
                        {/* Order Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">
                              TRX ID
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {order.trxId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">
                              Address
                            </p>
                            <p className="text-sm text-gray-700">
                              {order.customerAddress}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">
                              Subtotal
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              <span className=" text-base font-sans">৳</span>
                              {order.subtotal}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">
                              Discount
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              <span className=" text-base font-sans">৳</span>
                              {order.discountAmount}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-3">
                            ORDER ITEMS
                          </p>
                          <div className="space-y-2">
                            {order.orderItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 bg-white p-3 rounded border"
                              >
                                <img
                                  src={
                                    typeof item.product.mainImages === "string"
                                      ? item.product.mainImages
                                      : item.product.mainImages[0]
                                  }
                                  alt={item.product.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.product.title}
                                  </p>
                                  <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                                    <span>
                                      Qty: <strong>{item.quantity}</strong>
                                    </span>
                                    <span>
                                      Price:{" "}
                                      <span className=" text-base font-sans">
                                        ৳
                                      </span>
                                      <strong>{item.price}</strong>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">
                              NOTES
                            </p>
                            <p className="text-sm text-gray-700">
                              {order.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className=" py-3">
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={orderMetaData?.total}
          itemsPerPage={orderMetaData?.limit}
        />
      </div>
    </div>
  );
};

export default OrderTable;
