"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetAllOrdersQuery } from "@/redux/Api/orderApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Package } from "lucide-react";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import SearchBar from "@/components/Common/SearchBar";
import { PaginationControl } from "@/components/Common/Pagination";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { IMeta } from "@/types/metaTypes";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateOrderStatusMutation } from "@/redux/Api/orderApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IOrderItem {
  id: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    title: string;
    slug: string;
  };
  color: {
    id: string;
    name: string;
    hexCode: string;
  };
  options: {
    id: string;
    option: {
      value: string;
      group: { title: string; type: string };
    };
  }[];
}

export interface IOrder {
  id: string;
  traxId: string;
  totalAmount: string;
  discount: string;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  orderStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  type: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null };
  orderItems: IOrderItem[];
}

// ─── Badge styles ─────────────────────────────────────────────────────────────

const paymentStatusStyle: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-700 border-gray-200",
};

const orderStatusStyle: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

// ─── DatePicker ───────────────────────────────────────────────────────────────

const DatePickerField = ({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const dateValue = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-36 justify-start text-left text-sm font-normal bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors",
            !value && "text-gray-400",
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">
            {dateValue ? format(dateValue, "dd MMM yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-lg border-gray-200"
        align="start"
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          initialFocus
        />
        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-500 hover:text-red-500"
              onClick={() => onChange("")}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// ─── Update Status Modal ──────────────────────────────────────────────────────

const UpdateStatusModal = ({
  isOpen,
  onClose,
  order,
}: {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder | null;
}) => {
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    if (order) {
      setOrderStatus(order.orderStatus);
      setPaymentStatus(order.paymentStatus);
      setTransactionId("");
    }
  }, [order]);

  const handleUpdate = async () => {
    if (!order) return;

    try {
      const res = await updateOrderStatus({
        orderId: order.id,
        data: {
          orderStatus,
          paymentStatus,
          transactionId: transactionId || undefined,
        },
      }).unwrap();

      if (res?.statusCode === 200) {
        toast.success("Order updated successfully", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-primary" />
            Update Order Status
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="orderStatus">Order Status</Label>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger id="orderStatus">
                <SelectValue placeholder="Select order status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-gray-400">
              Note: Changing to CONFIRMED requires payment SUCCESS.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger id="paymentStatus">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID if any"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ManageOrder = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [orderStatus, setOrderStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      searchTerm: searchTerm.trim() || undefined,
      orderStatus: orderStatus !== "all" ? [orderStatus] : undefined,
      paymentStatus: paymentStatus !== "all" ? [paymentStatus] : undefined,
      sortOrder,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [
      currentPage,
      limit,
      searchTerm,
      orderStatus,
      paymentStatus,
      sortOrder,
      startDate,
      endDate,
    ],
  );

  const { data: order, isLoading } = useGetAllOrdersQuery(queryParams);

  if (isLoading) return <TableSkeleton />;

  const orderFilterData = filterDeleteData(order) || [];
  const orderData: IOrder[] =
    orderFilterData?.data?.data || orderFilterData?.data || [];
  const orderMetaData: IMeta = orderFilterData?.data?.meta || {};

  const totalPages = Number(orderMetaData?.totalPages || 1);
  const totalItems = Number(orderMetaData?.total || orderData.length);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
    setLimit(10);
    setOrderStatus("all");
    setPaymentStatus("all");
    setSortOrder("desc");
    setStartDate("");
    setEndDate("");
  };

  const handleOpenUpdateModal = (order: IOrder) => {
    setSelectedOrder(order);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* ── Update Status Modal ── */}
      <UpdateStatusModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        order={selectedOrder}
      />

      {/* ── Toolbar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Left: Search */}
        <form onSubmit={handleSearch} className="w-full xl:w-72 shrink-0">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
          />
        </form>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Order Status */}
          <Select
            value={orderStatus}
            onValueChange={(val) => {
              setOrderStatus(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-38 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="PENDING">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                  Pending
                </span>
              </SelectItem>
              <SelectItem value="CONFIRMED">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  Confirmed
                </span>
              </SelectItem>
              <SelectItem value="DELIVERED">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Delivered
                </span>
              </SelectItem>
              <SelectItem value="SHIPPED">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  Shipped
                </span>
              </SelectItem>
              <SelectItem value="CANCELLED">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  Cancelled
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status */}
          <Select
            value={paymentStatus}
            onValueChange={(val) => {
              setPaymentStatus(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-38 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="PENDING">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                  Pending
                </span>
              </SelectItem>
              <SelectItem value="SUCCESS">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Success
                </span>
              </SelectItem>
              <SelectItem value="FAILED">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  Failed
                </span>
              </SelectItem>
              <SelectItem value="REFUNDED">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
                  Refunded
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sortOrder}
            onValueChange={(val) => {
              setSortOrder(val as "asc" | "desc");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-36 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">↓ Newest First</SelectItem>
              <SelectItem value="asc">↑ Oldest First</SelectItem>
            </SelectContent>
          </Select>

          {/* Start Date */}
          <DatePickerField
            value={startDate}
            onChange={(v) => {
              setStartDate(v);
              setCurrentPage(1);
            }}
            placeholder="Start date"
          />

          {/* End Date */}
          <DatePickerField
            value={endDate}
            onChange={(v) => {
              setEndDate(v);
              setCurrentPage(1);
            }}
            placeholder="End date"
          />
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <div className="flex items-center gap-1.5">
          <Package className="h-4 w-4" />
          <span>
            Showing{" "}
            <span className="font-medium text-gray-800">
              {orderData.length}
            </span>{" "}
            of <span className="font-medium text-gray-800">{totalItems}</span>{" "}
            orders
          </span>
        </div>
        <span>
          Page <span className="font-medium text-gray-700">{currentPage}</span>{" "}
          / {totalPages}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="border rounded-md overflow-hidden ">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Trax ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orderData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Package className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No orders found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orderData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-500 text-sm">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell className="font-mono font-semibold text-sm">
                    {item.traxId}
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">{item.email}</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {item.phoneNumber}
                  </TableCell>

                  <TableCell className="max-w-30 truncate text-sm text-gray-600">
                    {item.address}
                  </TableCell>

                  <TableCell className="max-w-40">
                    {item.orderItems.map((oi) => (
                      <div key={oi.id} className="text-xs">
                        <p className="truncate font-medium text-gray-800">
                          {oi.product.title}
                        </p>
                        <p className="text-gray-400">
                          {oi?.color?.name} ·{" "}
                          {oi?.options?.map((o) => o.option.value).join(", ")} ·
                          x{oi?.quantity}
                        </p>
                      </div>
                    ))}
                  </TableCell>

                  <TableCell className="text-sm font-semibold text-gray-900">
                    ৳{Number(item.totalAmount).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    {Number(item.discount) > 0 ? (
                      <span className="text-xs text-green-600 font-medium">
                        -৳{Number(item.discount).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => handleOpenUpdateModal(item)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all hover:brightness-95 active:scale-95 ${
                        paymentStatusStyle[item.paymentStatus] ?? ""
                      }`}
                    >
                      {item.paymentStatus}
                    </button>
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => handleOpenUpdateModal(item)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all hover:brightness-95 active:scale-95 ${
                        orderStatusStyle[item.orderStatus] ?? ""
                      }`}
                    >
                      {item.orderStatus}
                    </button>
                  </TableCell>

                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenUpdateModal(item)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                        title="Update Status"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/admin/orders/${item.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination + Per Page + Reset ── */}
      <div className="flex flex-col gap-3 pt-1 pl-1">
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            if (page < 1 || page > totalPages || page === currentPage) return;
            setCurrentPage(page);
          }}
          totalItems={totalItems}
          itemsPerPage={limit}
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="whitespace-nowrap">Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => {
                setLimit(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-sm text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 transition-colors px-3 whitespace-nowrap"
            onClick={handleReset}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageOrder;
