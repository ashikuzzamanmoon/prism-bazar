"use client";

import { Order } from "@/types/orderTypes";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 0,
    }).format(amount);

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

const statusConfig = (status: string) => {
    switch (status) {
        case "SUCCESS":
        case "CONFIRMED":
            return {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-200",
                dot: "bg-emerald-500",
            };
        case "FAILED":
        case "CANCELLED":
            return {
                bg: "bg-red-50",
                text: "text-red-700",
                border: "border-red-200",
                dot: "bg-red-500",
            };
        default:
            return {
                bg: "bg-amber-50",
                text: "text-amber-700",
                border: "border-amber-200",
                dot: "bg-amber-500",
            };
    }
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = statusConfig(status);
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OrderFail = ({ invoiceData }: { invoiceData: Order }) => {
    const isFailed =
        invoiceData.paymentStatus === "FAILED" ||
        invoiceData.status === "CANCELLED";

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-5 bg-white p-3">

                {/* ── Failure Banner ── */}
                <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5 border border-gray-100 border-l-4 border-l-red-500">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-gray-900">
                            Payment Failed — Order Cancelled
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                            We were unable to process your payment. Please try again or use a
                            different method.
                        </p>
                    </div>
                    <div className="ml-auto hidden sm:block text-right">
                        <p className="text-xs text-gray-400">Order ID</p>
                        <p className="text-xl font-black text-red-500 tracking-tight">
                            #{invoiceData.traxId}
                        </p>
                    </div>
                </div>

                {/* ── Error Detail Card ── */}
                <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 flex items-start gap-3">
                    <svg
                        className="text-red-400 flex-shrink-0 mt-0.5"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                        <p className="text-sm font-bold text-red-700 mb-1">
                            What happened?
                        </p>
                        <p className="text-sm text-red-600 leading-relaxed">
                            Your payment could not be completed and this order has been
                            automatically cancelled. No amount has been deducted from your
                            account. If you believe this is an error, please contact our
                            support team.
                        </p>
                    </div>
                </div>

                {/* ── Invoice Card ── */}
                <div className="bg-white rounded-2xl  border border-gray-100 overflow-hidden">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 px-8 pt-8 pb-6">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/prism-bazar-logo.svg"
                                alt="Prism Bazar Logo"
                                width={200}
                                height={60}
                                className="w-8 sm:w-10 md:w-10 lg:w-10 h-auto object-contain"
                            />
                            <div>
                                <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                                    Prism Bazar
                                </p>
                                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mt-0.5">
                                    কাজীপুর, সিরাজগঞ্জ
                                </p>
                            </div>
                        </div>

                        {/* Invoice Meta */}
                        <div className="sm:text-right space-y-1">
                            <p className="text-[10px] font-bold tracking-[2px] text-gray-400 uppercase">
                                Failed Order
                            </p>
                            <p className="text-3xl font-black text-red-500 tracking-tight">
                                #{invoiceData.traxId}
                            </p>
                            <p className="text-sm text-gray-500">
                                {formatDate(invoiceData.invoiceDate)}
                            </p>
                            <div className="flex sm:justify-end gap-2 flex-wrap pt-1">
                                <StatusBadge status={invoiceData.status} />
                                <StatusBadge status={invoiceData.paymentStatus} />
                            </div>
                        </div>
                    </div>

                    {/* Red gradient bar */}
                    <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

                    {/* ── Info Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        {/* Bill To */}
                        <div className="px-8 py-6">
                            <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#ff7200] inline-block" />
                                Customer Info
                            </p>
                            <p className="text-base font-bold text-gray-900 mb-3">
                                {invoiceData.customer.name}
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                    <svg
                                        className="text-[#ff7200] flex-shrink-0"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,12 2,6" />
                                    </svg>
                                    {invoiceData.customer.email}
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                    <svg
                                        className="text-[#ff7200] flex-shrink-0"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                                    </svg>
                                    {invoiceData.customer.phoneNumber}
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                    <svg
                                        className="text-[#ff7200] flex-shrink-0"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {invoiceData.customer.address}
                                </div>
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className="px-8 py-6">
                            <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#ff7200] inline-block" />
                                Order Status
                            </p>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        Order Status
                                    </span>
                                    <StatusBadge status={invoiceData.status} />
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        Payment Status
                                    </span>
                                    <StatusBadge status={invoiceData.paymentStatus} />
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        Date
                                    </span>
                                    <span className="text-xs font-semibold text-gray-800 text-right">
                                        {formatDate(invoiceData.invoiceDate)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        Amount Charged
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 text-right">
                                        ৳ 0 (Not charged)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dashed divider */}
                    <div className="mx-8 border-t border-dashed border-gray-200" />

                    {/* ── Items ── */}
                    <div className="px-8 py-6">
                        <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#ff7200] inline-block" />
                            Items in Order{" "}
                            <span className="text-red-400 normal-case font-semibold tracking-normal ml-1">
                                (not processed)
                            </span>
                        </p>

                        <div className="overflow-x-auto -mx-2">
                            <table className="w-full text-sm min-w-[520px]">
                                <thead>
                                    <tr className="bg-red-50">
                                        <th className="text-left text-[10px] font-bold tracking-widest uppercase text-red-400 px-4 py-3 rounded-l-xl">
                                            Product
                                        </th>
                                        <th className="text-center text-[10px] font-bold tracking-widest uppercase text-red-400 px-4 py-3">
                                            Qty
                                        </th>
                                        <th className="text-center text-[10px] font-bold tracking-widest uppercase text-red-400 px-4 py-3">
                                            Unit Price
                                        </th>
                                        <th className="text-right text-[10px] font-bold tracking-widest uppercase text-red-400 px-4 py-3 rounded-r-xl">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.items.map((item, idx) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-gray-50 opacity-60 ${idx % 2 === 1 ? "bg-gray-50/60" : ""
                                                }`}
                                        >
                                            {/* Product info */}
                                            <td className="px-4 py-4 align-top">
                                                <p className="font-semibold text-gray-700 text-xs leading-relaxed mb-2 max-w-xs line-through decoration-red-300">
                                                    {item.product.title}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {/* Color tag */}
                                                    <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2 py-0.5 text-[11px] text-gray-500 font-medium">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0"
                                                            style={{ backgroundColor: item?.color?.hexCode }}
                                                        />
                                                        {item?.color?.name}
                                                    </span>
                                                    {/* Option tags */}
                                                    {item.options.map((opt) => (
                                                        <span
                                                            key={opt.id}
                                                            className="inline-flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-md px-2 py-0.5 text-[11px] text-[#ff7200] font-semibold"
                                                        >
                                                            {typeof opt.group === "object" &&
                                                                opt.group !== null && (
                                                                    <>{opt.group.title}: </>
                                                                )}
                                                            {opt.value}
                                                            {opt.extraPrice > 0 && (
                                                                <span className="text-[#ff944d] ml-0.5">
                                                                    +{formatCurrency(opt.extraPrice)}
                                                                </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
                                                    {item.product.modelNumber.trim()}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-center font-bold text-gray-600 align-middle">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-500 font-medium align-middle">
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="px-4 py-4 text-right font-extrabold text-gray-500 align-middle">
                                                {formatCurrency(item.itemTotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Summary ── */}
                    <div className="px-8 pb-8">
                        <div className="w-full bg-red-50 rounded-2xl p-5 border border-red-100">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Order Value</span>
                                    <span className="text-sm font-semibold text-gray-500 line-through decoration-red-300">
                                        {formatCurrency(invoiceData.items.reduce((s, i) => s + i.itemTotal, 0))}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Amount Charged</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        ৳ 0
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-red-200 pt-3 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700">
                                        Status
                                    </span>
                                    <span className="text-base font-black text-red-500 tracking-tight">
                                        NOT PROCESSED
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="bg-red-50 border-t border-red-100 px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <img
                                src="/prism-bazar-logo.svg"
                                alt="Prism Bazar Logo"
                                width={200}
                                height={60}
                                className="w-6 sm:w-8 md:w-8 lg:w-8 h-auto object-contain"
                            />
                            <div>
                                <p className="text-sm font-extrabold text-gray-900">
                                    Prism Bazar
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    We&apos;re sorry this didn&apos;t go through.
                                </p>
                            </div>
                        </div>
                        <div className="sm:text-right text-xs text-gray-400 space-y-0.5">
                            <p>
                                Attempted:{" "}
                                <span className="font-semibold text-gray-600">
                                    {formatDate(invoiceData.invoiceDate)}
                                </span>
                            </p>
                            <p className="text-red-400 font-semibold">
                                Order auto-cancelled
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Action Buttons ── */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
                    <button
                        onClick={() => (window.location.href = "/contact")}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-red-300 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        Contact Support
                    </button>

                    <button
                        onClick={() => (window.location.href = "/checkout")}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff7200] hover:bg-[#ff944d] text-white font-bold text-sm shadow-md shadow-orange-200 transition-colors"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                        </svg>
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderFail;