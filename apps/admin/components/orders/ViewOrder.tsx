"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useGetSingleOrderQuery, useVerifyOrderPaymentMutation } from "@/redux/Api/orderApi";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Tag,
  Receipt,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Ticket,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/button";

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  SUCCESS:   { dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"  },
  CONFIRMED: { dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"   },
  DELIVERED: { dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"  },
  PENDING:   { dot: "bg-amber-400",  text: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"  },
  CANCELLED: { dot: "bg-red-500",    text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    },
  FAILED:    { dot: "bg-red-500",    text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 border-b border-gray-200">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="font-medium text-sm text-gray-700">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const InfoRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: any;
}) => (
  <div className="flex flex-col xs:flex-row xs:items-start gap-1 xs:gap-3 py-2.5 border-b border-gray-100 last:border-0">
    {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 hidden xs:block shrink-0" />}
    <div className="flex-1 flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 xs:gap-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-xs sm:text-sm font-medium text-gray-900 break-words">{value}</span>
    </div>
  </div>
);

/** Animated dot + status text — used inside the grouped status header card */
const StatusDot = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] ?? { dot: "bg-gray-400", text: "text-gray-600" };
  return (
    <span className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.text}`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${cfg.dot}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
      </span>
      {status}
    </span>
  );
};

/** Small pill badge — used in transaction section */
const StatusPill = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] ?? { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ViewOrder = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data, isLoading } = useGetSingleOrderQuery(id);
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyOrderPaymentMutation();

  const handleVerifyPayment = async () => {
    try {
      await verifyPayment(id).unwrap();
      toast.success("পেমেন্ট সফলভাবে ভেরিফাই ও নিশ্চিত করা হয়েছে!");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "পেমেন্ট ভেরিফাই ব্যর্থ হয়েছে");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse mb-4 md:mb-6" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 md:p-5 space-y-3">
            <div className="h-5 bg-gray-100 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-50 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-50 rounded w-3/4 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const order = data?.data;
  if (!order)
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 text-center text-gray-400">
        Order not found.
      </div>
    );

  const { customer, items, summary, payment, timestamps } = order;
  const transaction = payment?.transaction;
  const promoDiscount = summary?.discount;

  const paymentCfg = statusConfig[payment?.status] ?? statusConfig["PENDING"];
  const orderCfg   = statusConfig[order.status]    ?? statusConfig["PENDING"];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">

      {/* ── Header ── */}
      <div className="mb-6 md:mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-600 cursor-pointer hover:text-white hover:bg-primary -ml-3 mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title + date */}
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Order #{order.traxId}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-500">
                {new Date(timestamps?.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── Status Group Card & Action ── */}
          <div className="flex flex-wrap items-center gap-3">
            {payment?.status === "PENDING" && (
              <Button
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm"
              >
                <CheckCircle className="h-4 w-4" />
                {isVerifying ? "ভেরিফাই হচ্ছে..." : "পেমেন্ট ভেরিফাই করুন"}
              </Button>
            )}
            <div className="flex items-stretch rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden w-fit">
            {/* Payment */}
            <div className="flex items-center gap-3 px-4 py-3 border-r border-gray-100">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${paymentCfg.bg}`}>
                <CreditCard className={`h-4 w-4 ${paymentCfg.text}`} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xs text-gray-400 font-medium uppercase tracking-wider leading-none">
                  Payment
                </span>
                <StatusDot status={payment?.status} />
              </div>
            </div>
            {/* Vertical separator dot */}
            <div className="flex items-center px-0">
              <span className="w-px h-8 bg-gray-100" />
            </div>
            {/* Order */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${orderCfg.bg}`}>
                <Package className={`h-4 w-4 ${orderCfg.text}`} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xs text-gray-400 font-medium uppercase tracking-wider leading-none">
                  Order
                </span>
                <StatusDot status={order.status} />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Customer Info & Payment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Customer Information" icon={User}>
            <div className="divide-y divide-gray-100">
              <InfoRow icon={User}   label="Full Name" value={customer?.name} />
              <InfoRow icon={Mail}   label="Email"     value={customer?.email || "N/A"} />
              <InfoRow icon={Phone}  label="Phone"     value={customer?.phoneNumber} />
              <InfoRow icon={MapPin} label="Address"   value={customer?.address} />
              {order.deliveryZone && (
                <InfoRow
                  icon={MapPin}
                  label="ডেলিভারি এলাকা"
                  value={`${order.deliveryZone.name} (${order.deliveryZone.area})`}
                />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Payment Summary" icon={CreditCard}>
            <div className="divide-y divide-gray-100">
              <InfoRow
                label="Payment Method"
                value={
                  payment?.method === "BKASH_MANUAL"
                    ? "বিকাশ (ম্যানুয়াল)"
                    : payment?.method === "NAGAD_MANUAL"
                    ? "নগদ (ম্যানুয়াল)"
                    : payment?.method?.replace(/_/g, " ")
                }
              />
              {(transaction?.transactionId || order.transactionId) && (
                <InfoRow
                  label="TrxID (ট্রানজেকশন আইডি)"
                  value={
                    <span className="font-mono font-bold text-primary">
                      {transaction?.transactionId || order.transactionId}
                    </span>
                  }
                />
              )}
              <InfoRow label="Subtotal" value={`৳${Number(summary?.subtotal ?? 0).toLocaleString()}`} />
              <InfoRow label="Delivery Charge" value={`৳${Number(order.deliveryCharge ?? 0).toLocaleString()}`} />
              {Number(promoDiscount?.amount) > 0 && (
                <InfoRow
                  label={`Discount${promoDiscount?.code ? ` (${promoDiscount.code})` : ""}`}
                  value={
                    <span className="text-green-600 font-medium">
                      -৳{Number(promoDiscount.amount).toLocaleString()}
                    </span>
                  }
                />
              )}
              <div className="pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Amount</span>
                  <span className="text-lg sm:text-xl font-semibold text-primary">
                    ৳{Number(summary?.total ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Order Items */}
        <SectionCard title="Order Items" icon={Package}>
          <div className="space-y-4">
            {items?.map((item: any, index: number) => (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:justify-between gap-4 pb-4 ${
                  index !== items.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-3 break-words">
                    {item.product?.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color?.hexCode }}
                      />
                      <span className="text-xs text-gray-600">{item.color?.name}</span>
                    </div>
                    {item.options?.map((o: any) => (
                      <span
                        key={o.id}
                        className="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 whitespace-nowrap"
                      >
                        {o.group?.title}: {o.value}
                        {Number(o.extraPrice) > 0 && (
                          <span className="text-gray-400 ml-1">
                            (+৳{Number(o.extraPrice).toLocaleString()})
                          </span>
                        )}
                      </span>
                    ))}
                    <span className="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 whitespace-nowrap">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end justify-center min-w-[110px]">
                  <span className="text-xl font-bold text-primary">
                    ৳{Number(item.itemTotal ?? 0).toLocaleString()}
                  </span>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ৳{Number(item.unitPrice).toLocaleString()} × {item.quantity}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Promo Code & Transaction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Redesigned Promo Coupon Card ── */}
          {promoDiscount?.code && (
            <SectionCard title="Promo Code Applied" icon={Tag}>
              <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5">
                {/* Decorative blobs */}
                <span className="pointer-events-none absolute -right-5 -top-5 w-24 h-24 rounded-full bg-emerald-100/60" />
                <span className="pointer-events-none absolute right-4 -bottom-8 w-20 h-20 rounded-full bg-teal-100/50" />

                {/* Icon + code */}
                <div className="relative flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
                      <Ticket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xs text-emerald-600 font-semibold uppercase tracking-widest mb-0.5">
                        Promo Code
                      </p>
                      <p className="font-mono font-bold text-gray-800 text-base tracking-widest">
                        {promoDiscount.code}
                      </p>
                    </div>
                  </div>
                  {/* ACTIVE pill */}
                  <span className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-dashed border-emerald-300 text-emerald-600 text-xs font-bold shadow-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    ACTIVE
                  </span>
                </div>

                {/* Dashed coupon tear line */}
                <div className="relative my-4">
                  <div className="border-t border-dashed border-emerald-200" />
                  <span className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-emerald-200" />
                  <span className="absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-emerald-200" />
                </div>

                {/* Type + savings */}
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-2xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                      Discount Type
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {promoDiscount.type ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                      You Saved
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      -৳{Number(promoDiscount.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Transaction Details */}
          {transaction && (
            <SectionCard title="Transaction Details" icon={Receipt}>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <span className="text-xs text-gray-500">Transaction ID</span>
                  <span className="font-mono text-xs font-medium text-gray-900 break-all">
                    {transaction.transactionId}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <span className="text-xs text-gray-500">Amount</span>
                  <span className="font-medium text-gray-900">
                    ৳{Number(transaction.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <span className="text-xs text-gray-500">Method</span>
                  <span className="text-xs font-medium text-gray-700">
                    {transaction.type?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <span className="text-xs text-gray-500">Status</span>
                  <StatusPill status={transaction.status} />
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <span className="text-xs text-gray-500">Date</span>
                  <span className="text-xs text-gray-600">
                    {new Date(transaction.date).toLocaleString()}
                  </span>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      <style jsx>{`
        .text-2xs {
          font-size: 0.65rem;
          line-height: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default ViewOrder;