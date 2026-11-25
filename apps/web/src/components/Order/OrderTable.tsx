"use client";
import { Order } from "@/types/orderTypes";
import domtoimage from "dom-to-image";
import jsPDF from "jspdf";
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Truck,
  ShoppingBag,
  ChevronDown,
  Tag,
  FileText,
  Loader2,
  X,
  Download,
  User,
  MapPin,
  Phone,
  Mail,
  Hash,
  Calendar,
  Package,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = (amount: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(amount);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const productImg = (item: any) => {
  const imgs = item.product?.images;
  if (imgs?.length > 0) {
    const p = imgs.find((i: any) => i.isPrimary) || imgs[0];
    if (p?.url && !p.url.includes("example.com")) return p.url;
  }
  return "/prism-bazar-logo.svg";
};

// ─── Status configs ───────────────────────────────────────────────────────────

const orderStyle = (s: string) =>
  ({
    CONFIRMED: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle size={11} />,
      label: "Confirmed",
    },
    CANCELLED: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <XCircle size={11} />,
      label: "Cancelled",
    },
    PENDING: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <Clock size={11} />,
      label: "Pending",
    },
  })[s] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    icon: null,
    label: s,
  };

const payStyle = (s: string) =>
  ({
    SUCCESS: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Paid",
    },
    FAILED: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
      label: "Failed",
    },
    PENDING: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      label: "Pending",
    },
  })[s] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
    label: s,
  };

// ─── Table Badges ─────────────────────────────────────────────────────────────

const OrderBadge = ({ status }: { status: string }) => {
  const c = orderStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.icon} {c.label}
    </span>
  );
};

const PayBadge = ({ status }: { status: string }) => {
  const c = payStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {c.label}
    </span>
  );
};

const MethodBadge = ({ method }: { method: string }) => {
  if (method === "BKASH_MANUAL") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600">
        <CreditCard size={11} className="text-pink-500" /> বিকাশ (ম্যানুয়াল)
      </span>
    );
  }
  if (method === "NAGAD_MANUAL") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
        <CreditCard size={11} className="text-amber-500" /> নগদ (ম্যানুয়াল)
      </span>
    );
  }
  const online = method === "ONLINE_PAYMENT";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 font-medium">
      {online ? (
        <CreditCard size={11} className="text-purple-500" />
      ) : (
        <Truck size={11} className="text-emerald-600" />
      )}
      {online ? "Online Payment" : "Cash on Delivery"}
    </span>
  );
};

// ─── Invoice status pill (inline styles only — for domtoimage capture) ────────

const InvoiceStatusPill = ({ status }: { status: string }) => {
  const map: Record<
    string,
    { bg: string; border: string; color: string; dot: string }
  > = {
    SUCCESS: {
      bg: "#f0fdf4",
      border: "#bbf7d0",
      color: "#15803d",
      dot: "#22c55e",
    },
    CONFIRMED: {
      bg: "#f0fdf4",
      border: "#bbf7d0",
      color: "#15803d",
      dot: "#22c55e",
    },
    FAILED: {
      bg: "#fef2f2",
      border: "#fecaca",
      color: "#b91c1c",
      dot: "#ef4444",
    },
    CANCELLED: {
      bg: "#fef2f2",
      border: "#fecaca",
      color: "#b91c1c",
      dot: "#ef4444",
    },
    PENDING: {
      bg: "#fffbeb",
      border: "#fde68a",
      color: "#b45309",
      dot: "#f59e0b",
    },
  };
  const c = map[status] ?? {
    bg: "#f9fafb",
    border: "#e5e7eb",
    color: "#4b5563",
    dot: "#9ca3af",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        borderRadius: "999px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontSize: "11px",
        fontWeight: 700,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
};

// ─── Invoice template (100% inline styles — device-independent PDF output) ────

const InvoiceTemplate = ({ order }: { order: Order }) => (
  <div
    style={{
      width: "100%",
      minHeight: "1056px",
      background: "#ffffff",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      color: "#111827",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Header */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "32px 32px 24px",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="/prism-bazar-logo.svg"
          alt="Prism Bazar"
          style={{ width: "40px", height: "40px", objectFit: "contain" }}
        />
        <div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#111827",
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}
          >
            Prism Bazar
          </div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#9CA3AF",
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              marginTop: "3px",
            }}
          >
            কাজীপুর, সিরাজগঞ্জ
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" as const }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "2px",
            color: "#9CA3AF",
            textTransform: "uppercase" as const,
          }}
        >
          Invoice
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 900,
            color: "#16a34a",
            letterSpacing: "-1px",
            lineHeight: 1.1,
          }}
        >
          #{order.traxId}
        </div>
        <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>
          {fmtDate(order.invoiceDate)}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "6px",
            marginTop: "8px",
            flexWrap: "wrap" as const,
          }}
        >
          <InvoiceStatusPill status={order.status} />
          <InvoiceStatusPill status={order.paymentStatus} />
        </div>
      </div>
    </div>

    {/* Orange bar */}
    <div
      style={{
        height: "3px",
        background: "linear-gradient(to right, #16a34a, #22c55e, #16a34a)",
      }}
    />

    {/* Info grid */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      {/* Bill To */}
      <div style={{ padding: "24px 32px", borderRight: "1px solid #F3F4F6" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            color: "#9CA3AF",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#16a34a",
              display: "inline-block",
            }}
          />
          Bill To
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "10px",
          }}
        >
          {order.customer.name}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column" as const,
            gap: "7px",
          }}
        >
          {[
            {
              path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 6L2 6",
              val: order.customer.email,
            },
            {
              path: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.18 2 2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z",
              val: order.customer.phoneNumber,
            },
            {
              path: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 10-6 0",
              val: order.customer.address,
            },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                fontSize: "13px",
                color: "#4B5563",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                style={{ flexShrink: 0, marginTop: "1px" }}
              >
                <path d={row.path} />
              </svg>
              <span style={{ lineHeight: 1.5 }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div style={{ padding: "24px 32px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            color: "#9CA3AF",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#16a34a",
              display: "inline-block",
            }}
          />
          Payment Details
        </div>
        {/* Use a table layout so label col is fixed-width and value never overlaps */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse" as const,
            fontSize: "12px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  color: "#9CA3AF",
                  paddingBottom: "9px",
                  width: "90px",
                  verticalAlign: "middle" as const,
                }}
              >
                Method
              </td>
              <td
                style={{
                  fontWeight: 600,
                  color: "#1F2937",
                  paddingBottom: "9px",
                  verticalAlign: "middle" as const,
                }}
              >
                {order.payment.method === "CASH_ON_DELIVERY"
                  ? "Cash on Delivery"
                  : order.payment.method.replace(/_/g, " ")}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  color: "#9CA3AF",
                  paddingBottom: "9px",
                  verticalAlign: "middle" as const,
                }}
              >
                Status
              </td>
              <td
                style={{
                  paddingBottom: "9px",
                  verticalAlign: "middle" as const,
                }}
              >
                <InvoiceStatusPill status={order.payment.status} />
              </td>
            </tr>
            {order.payment.transaction && (
              <>
                <tr>
                  <td
                    style={{
                      color: "#9CA3AF",
                      paddingBottom: "9px",
                      verticalAlign: "top" as const,
                    }}
                  >
                    Txn ID
                  </td>
                  <td
                    style={{
                      fontSize: "10px",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "#374151",
                      wordBreak: "break-all" as const,
                      lineHeight: 1.6,
                      paddingBottom: "9px",
                      verticalAlign: "top" as const,
                    }}
                  >
                    {order.payment.transaction.transactionId}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      color: "#9CA3AF",
                      verticalAlign: "middle" as const,
                    }}
                  >
                    Date
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      color: "#1F2937",
                      verticalAlign: "middle" as const,
                    }}
                  >
                    {fmtDate(order.payment.transaction.date)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Dashed divider */}
    <div style={{ margin: "0 32px", borderTop: "1px dashed #E5E7EB" }} />

    {/* Items */}
    <div style={{ padding: "24px 32px" }}>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase" as const,
          color: "#9CA3AF",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#16a34a",
            display: "inline-block",
          }}
        />
        Order Items
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse" as const,
          fontSize: "13px",
        }}
      >
        <thead>
          <tr style={{ background: "#FFF7F0" }}>
            {(["Product", "Qty", "Unit Price", "Total"] as const).map(
              (h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase" as const,
                    color: "#16a34a",
                    textAlign: (i === 0
                      ? "left"
                      : i === 3
                        ? "right"
                        : "center") as any,
                    borderRadius:
                      i === 0
                        ? "8px 0 0 8px"
                        : i === 3
                          ? "0 8px 8px 0"
                          : undefined,
                  }}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr
              key={item.id}
              style={{
                borderBottom: "1px solid #F9FAFB",
                background: idx % 2 === 1 ? "#F9FAFB" : "#fff",
              }}
            >
              <td
                style={{ padding: "14px 12px", verticalAlign: "top" as const }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      background: "#fff",
                      border: "1px solid #F3F4F6",
                      borderRadius: "6px",
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={productImg(item)}
                      alt={item.product.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#111827",
                        lineHeight: 1.5,
                        marginBottom: "6px",
                      }}
                    >
                      {item.product.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap" as const,
                        gap: "4px",
                      }}
                    >
                      {item.color && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "4px",
                            padding: "2px 7px",
                            fontSize: "11px",
                            color: "#4B5563",
                            fontWeight: 500,
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: item.color.hexCode,
                              border: "1px solid rgba(0,0,0,0.1)",
                              flexShrink: 0,
                            }}
                          />
                          {item.color.name}
                        </span>
                      )}
                      {item.options.map((opt) => (
                        <span
                          key={opt.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "#FFF7F0",
                            border: "1px solid #FFE0C2",
                            borderRadius: "4px",
                            padding: "2px 7px",
                            fontSize: "11px",
                            color: "#16a34a",
                            fontWeight: 600,
                          }}
                        >
                          {opt.group.title}: {opt.value}
                          {opt.extraPrice > 0 && (
                            <span
                              style={{ color: "#22c55e", marginLeft: "3px" }}
                            >
                              +{fmt(opt.extraPrice)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#9CA3AF",
                        marginTop: "5px",
                        fontFamily: "monospace",
                      }}
                    >
                      {item.product.modelNumber.trim()}
                    </div>
                  </div>
                </div>
              </td>
              <td
                style={{
                  padding: "14px 12px",
                  textAlign: "center" as const,
                  fontWeight: 700,
                  color: "#1F2937",
                  verticalAlign: "middle" as const,
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  padding: "14px 12px",
                  textAlign: "center" as const,
                  color: "#4B5563",
                  fontWeight: 500,
                  verticalAlign: "middle" as const,
                }}
              >
                {fmt(item.unitPrice)}
              </td>
              <td
                style={{
                  padding: "14px 12px",
                  textAlign: "right" as const,
                  fontWeight: 800,
                  color: "#111827",
                  verticalAlign: "middle" as const,
                }}
              >
                {fmt(item.itemTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Summary */}
    <div style={{ padding: "0 32px 32px" }}>
      <div
        style={{
          background: "#F9FAFB",
          borderRadius: "12px",
          padding: "24px 20px",
          border: "1px solid #F3F4F6",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6B7280" }}>Subtotal</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#1F2937" }}>
            {fmt(order.summary.subtotal)}
          </span>
        </div>
        {order.summary.discount.amount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "#6B7280",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Discount
              {order.summary.discount.code && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    background: "#FFF0E6",
                    color: "#16a34a",
                    padding: "2px 7px",
                    borderRadius: "4px",
                  }}
                >
                  {order.summary.discount.code}
                </span>
              )}
            </span>
            <span
              style={{ fontSize: "13px", fontWeight: 600, color: "#059669" }}
            >
              -{fmt(order.summary.discount.amount)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: "1px dashed #D1D5DB",
            paddingTop: "16px",
            marginTop: "4px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
            Total Amount
          </span>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#16a34a",
              letterSpacing: "-0.5px",
            }}
          >
            {fmt(order.summary.total)}
          </span>
        </div>
      </div>
    </div>

    {/* Footer — marginTop auto pushes it to the bottom within the flex column */}
    <div
      style={{
        background: "#FFF7F0",
        borderTop: "1px solid #FFE0C2",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap" as const,
        gap: "8px",
        marginTop: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src="/prism-bazar-logo.svg"
          alt="Prism Bazar"
          style={{ width: "28px", height: "28px", objectFit: "contain" }}
        />
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#111827" }}>
            Prism Bazar
          </div>
          <div style={{ fontSize: "10px", color: "#9CA3AF" }}>
            Thank you for your purchase!
          </div>
        </div>
      </div>
      <div
        style={{
          textAlign: "right" as const,
          fontSize: "11px",
          color: "#9CA3AF",
        }}
      >
        Order placed:{" "}
        <span style={{ fontWeight: 600, color: "#4B5563" }}>
          {fmtDate(order.timestamps.createdAt)}
        </span>
      </div>
    </div>
  </div>
);

// ─── Hidden invoice vault ─────────────────────────────────────────────────────
// Always mounted off-screen at fixed 768px width.
// domtoimage reads from these divs — screen size has zero effect on output.

const HiddenInvoiceVault = ({
  orders,
  vaultRef,
}: {
  orders: Order[];
  vaultRef: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}) => (
  <div
    aria-hidden="true"
    style={{
      position: "fixed",
      top: "-99999px",
      left: "-99999px",
      pointerEvents: "none",
      zIndex: -9999,
    }}
  >
    {orders.map((order) => (
      <div
        key={order.id}
        ref={(el) => {
          vaultRef.current[order.id] = el;
        }}
        style={{
          width: "768px",
          minWidth: "768px",
          minHeight: "1056px",
          background: "#ffffff",
          overflow: "visible",
        }}
      >
        <InvoiceTemplate order={order} />
      </div>
    ))}
  </div>
);

// ─── PDF download helper ──────────────────────────────────────────────────────

const imageToBase64 = async (url: string): Promise<string> => {
  try {
    const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return "";
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
};

const downloadPdf = async (
  getEl: () => HTMLDivElement | null,
  traxId: string,
): Promise<void> => {
  // getEl is called at event time (not during render) — no ref-during-render issue
  const el = getEl();
  if (!el) return;

  const imgs = el.querySelectorAll("img");
  const originals: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    Array.from(imgs).map(async (img) => {
      const src = img.src;
      if (
        src &&
        !src.startsWith("data:") &&
        !src.startsWith(window.location.origin)
      ) {
        originals.push({ img, src });
        const b64 = await imageToBase64(src);
        if (b64) img.src = b64;
      }
    }),
  );

  try {
    // Render at 2× pixel density for sharp output, then fit to A4
    const scale = 2;
    const dataUrl = await domtoimage.toPng(el, {
      bgcolor: "#ffffff",
      width: 768 * scale,
      height: el.scrollHeight * scale,
      cacheBust: true,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: "768px",
        height: `${el.scrollHeight}px`,
      },
    });
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });
    const props = pdf.getImageProperties(dataUrl);
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (props.height * pdfW) / props.width;
    pdf.addImage(dataUrl, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`invoice_${traxId}.pdf`);
  } finally {
    originals.forEach(({ img, src }) => {
      img.src = src;
    });
  }
};

// ─── Scaled invoice preview (modal only) ─────────────────────────────────────
// InvoiceTemplate is always 768px wide. On small screens we scale it down
// proportionally so it fits without breaking layout.

const ScaledInvoicePreview = ({ order }: { order: Order }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Recalculate scale whenever the wrapper is resized
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const calc = () => {
      const available = el.getBoundingClientRect().width;
      setScale(available < 768 ? available / 768 : 1);
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    // Outer wrapper — defines how much space the scaled invoice occupies
    <div
      ref={wrapRef}
      className="w-full rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white"
      style={{ height: scale < 1 ? `${1056 * scale}px` : undefined }}
    >
      {/* Inner — always 768px, scaled from top-left */}
      <div
        style={{
          width: "768px",
          transformOrigin: "top left",
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        <InvoiceTemplate order={order} />
      </div>
    </div>
  );
};

// ─── Invoice Modal ────────────────────────────────────────────────────────────

const InvoiceModal = ({
  order,
  getEl,
  onClose,
}: {
  order: Order;
  getEl: () => HTMLDivElement | null;
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadPdf(getEl, order.traxId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-sm font-bold text-white/90">
            Invoice <span className="text-[#16a34a]">#{order.traxId}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16a34a] hover:bg-[#22c55e] text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              {loading ? "Generating…" : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Preview — scaled to fit any screen width */}
        <ScaledInvoicePreview order={order} />
      </div>
    </div>
  );
};

// ─── Expanded row ─────────────────────────────────────────────────────────────

const ExpandedRow = ({
  order,
  getEl,
}: {
  order: Order;
  getEl: () => HTMLDivElement | null;
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadPdf(getEl, order.traxId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr>
      <td colSpan={7} className="p-0">
        <div className="border-t border-b border-gray-100 bg-gray-50/50 px-6 py-5">
          {/* Customer strip + PDF button */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              <User size={12} className="text-[#16a34a]" />
              {order.customer.name}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone size={12} className="text-[#16a34a]" />
              {order.customer.phoneNumber}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Mail size={12} className="text-[#16a34a]" />
              {order.customer.email}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} className="text-[#16a34a]" />
              {order.customer.address}
            </div>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#22c55e] text-white text-xs font-bold transition-all disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Download size={11} />
              )}
              {loading ? "…" : "PDF"}
            </button>
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Items */}
            <div className="md:col-span-6">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                <Package size={12} className="text-[#16a34a]" /> Order Items
              </p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                        <img
                          src={productImg(item)}
                          alt={item.product.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                          {item.product.title}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                          {item.product.modelNumber.trim()}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.color && (
                            <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-[10px] text-gray-600">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color.hexCode }}
                              />
                              {item.color.name}
                            </span>
                          )}
                          <span className="bg-orange-50 border border-orange-100 rounded px-1.5 py-0.5 text-[10px] text-[#16a34a] font-bold">
                            ×{item.quantity}
                          </span>
                          {item.options.map((opt) => (
                            <span
                              key={opt.id}
                              className="bg-orange-50 border border-orange-100 rounded px-1.5 py-0.5 text-[10px] text-[#16a34a] font-semibold"
                            >
                              {opt.group.title}: {opt.value}
                              {opt.extraPrice > 0 && ` +${fmt(opt.extraPrice)}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs">
                      <span className="text-gray-400">
                        Unit:{" "}
                        <span className="text-gray-600 font-medium">
                          {fmt(item.unitPrice)}
                        </span>
                      </span>
                      <span className="font-bold text-gray-900">
                        {fmt(item.itemTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction */}
            <div className="md:col-span-3">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                <CreditCard size={12} className="text-[#16a34a]" /> Transaction
              </p>
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">Method</p>
                  <MethodBadge method={order.payment.method} />
                </div>
                {order.payment.transaction ? (
                  <>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">
                        Transaction ID
                      </p>
                      <p className="text-[11px] font-mono text-gray-700 break-all leading-relaxed">
                        {order.payment.transaction.transactionId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">Date</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Calendar size={10} className="text-[#16a34a]" />
                        {fmtDateTime(order.payment.transaction.date)}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">
                    No transaction recorded
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="md:col-span-3">
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                <Hash size={12} className="text-[#16a34a]" /> Summary
              </p>
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-gray-700 font-medium">
                    {fmt(order.summary.subtotal)}
                  </span>
                </div>
                {order.summary.discount.amount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag size={10} />
                      {order.summary.discount.code ?? "Discount"}
                    </span>
                    <span className="tabular-nums">
                      -{fmt(order.summary.discount.amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2.5 border-t border-dashed border-gray-200">
                  <span className="text-sm font-bold text-gray-800">Total</span>
                  <span className="text-lg font-black text-[#16a34a] tabular-nums">
                    {fmt(order.summary.total)}
                  </span>
                </div>
              </div>
              <div className="mt-2 bg-white rounded-xl border border-gray-100 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Calendar size={10} className="text-gray-300" />
                  <span className="text-gray-400">Placed:</span>
                  <span className="font-medium text-gray-600">
                    {fmtDate(order.timestamps.createdAt)}
                  </span>
                </div>
                {order.timestamps.updatedAt &&
                  order.timestamps.updatedAt !== order.timestamps.createdAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Calendar size={10} className="text-gray-300" />
                      <span className="text-gray-400">Updated:</span>
                      <span className="font-medium text-gray-600">
                        {fmtDate(order.timestamps.updatedAt)}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyOrders = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-5">
      <ShoppingBag size={36} className="text-[#16a34a]/50" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-1.5">No orders yet</h3>
    <p className="text-gray-400 text-sm max-w-xs">
      You haven&apos;t placed any orders. Start shopping to see your orders
      here.
    </p>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export const OrderTable = ({ myOrderData }: { myOrderData: Order[] }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOrder, setModalOrder] = useState<Order | null>(null);

  // vaultRef holds HTMLDivElement refs keyed by order.id
  const vaultRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Returns a stable getter function for a given order id
  // This is a function, not a ref value — safe to pass as prop
  const makeGetEl = useCallback(
    (orderId: string) => () => vaultRef.current[orderId] ?? null,
    [],
  );

  const toggleRow = useCallback(
    (id: string) => setExpandedId((prev) => (prev === id ? null : id)),
    [],
  );

  if (!myOrderData || myOrderData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100">
        <EmptyOrders />
      </div>
    );
  }

  return (
    <>
      {/* Off-screen invoice vault — always in DOM, 768px fixed width */}
      <HiddenInvoiceVault orders={myOrderData} vaultRef={vaultRef} />

      {/* Invoice modal */}
      {modalOrder && (
        <InvoiceModal
          order={modalOrder}
          getEl={makeGetEl(modalOrder.id)}
          onClose={() => setModalOrder(null)}
        />
      )}

      <div className="max-w-7xl bg-white mx-auto rounded-2xl overflow-hidden border border-gray-300 my-6 md:my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">My Orders</h2>
          <span className="text-xs text-[#16a34a] font-semibold bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full tabular-nums">
            {myOrderData.length} {myOrderData.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {[
                  { label: "Order", cls: "pl-6 pr-4 text-left" },
                  { label: "Date", cls: "px-4 text-left" },
                  { label: "Items", cls: "px-4 text-left" },
                  { label: "Status", cls: "px-4 text-left" },
                  { label: "Payment", cls: "px-4 text-left" },
                  { label: "Total", cls: "px-4 text-right" },
                  { label: "Invoice", cls: "px-6 text-center" },
                ].map(({ label, cls }) => (
                  <th
                    key={label}
                    className={`py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${cls}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myOrderData.map((order) => {
                const open = expandedId === order.id;
                return (
                  <React.Fragment key={order.id}>
                    <tr
                      onClick={() => toggleRow(order.id)}
                      className={`cursor-pointer transition-colors ${open ? "bg-orange-50/30" : "hover:bg-gray-50/60"}`}
                    >
                      <td className="pl-6 pr-4 py-4">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            size={14}
                            className={`text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                          />
                          <div>
                            <p className="font-mono text-sm font-bold text-gray-900">
                              #{order.traxId}
                            </p>
                            <div className="mt-1">
                              <MethodBadge method={order.payment.method} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {fmtDateTime(order.invoiceDate)}
                      </td>
                      <td className="px-4 py-4 max-w-[170px]">
                        {order.items.map((item, i) => (
                          <div key={item.id} className={i > 0 ? "mt-1.5" : ""}>
                            <p className="text-xs text-gray-700 font-medium truncate">
                              {item.product.modelNumber.trim()}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              × {item.quantity}
                            </p>
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-4">
                        <OrderBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4">
                        <PayBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="text-sm font-bold text-gray-900 tabular-nums">
                          {fmt(order.summary.total)}
                        </p>
                        {order.summary.discount.amount > 0 && (
                          <p className="text-[11px] text-emerald-500 tabular-nums">
                            -{fmt(order.summary.discount.amount)}
                          </p>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setModalOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold hover:border-[#16a34a]/50 hover:text-[#16a34a] hover:bg-orange-50 transition-all"
                        >
                          <FileText size={12} /> View
                        </button>
                      </td>
                    </tr>

                    {open && (
                      <ExpandedRow order={order} getEl={makeGetEl(order.id)} />
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards ── */}
        <div className="md:hidden divide-y divide-gray-100">
          {myOrderData.map((order) => {
            const open = expandedId === order.id;
            return (
              <div key={order.id}>
                {/* Card header */}
                <div
                  className="flex items-start justify-between p-4 cursor-pointer"
                  onClick={() => toggleRow(order.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <ChevronDown
                      size={14}
                      className={`text-gray-300 transition-transform duration-200 mt-0.5 ${open ? "rotate-180" : ""}`}
                    />
                    <div>
                      <span className="font-mono text-sm font-bold text-gray-900">
                        #{order.traxId}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {fmtDateTime(order.invoiceDate)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalOrder(order);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold hover:border-[#16a34a]/50 hover:text-[#16a34a] transition-colors"
                  >
                    <FileText size={11} /> Invoice
                  </button>
                </div>

                {/* Items + badges */}
                <div className="px-4 pb-4 pl-10 space-y-2">
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-gray-600 truncate max-w-[180px]">
                          {item.product.modelNumber.trim()}
                        </span>
                        <span className="font-semibold text-gray-800 ml-2">
                          {fmt(item.itemTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <OrderBadge status={order.status} />
                      <PayBadge status={order.paymentStatus} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 tabular-nums">
                        {fmt(order.summary.total)}
                      </p>
                      {order.summary.discount.amount > 0 && (
                        <p className="text-xs text-emerald-500 tabular-nums">
                          -{fmt(order.summary.discount.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile expanded */}
                {open && (
                  <div className="mx-4 mb-4 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                    {/* Customer */}
                    <div className="px-4 py-3 border-b border-gray-50 space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Customer
                      </p>
                      {[
                        {
                          icon: <User size={11} />,
                          val: order.customer.name,
                          bold: true,
                        },
                        {
                          icon: <Mail size={11} />,
                          val: order.customer.email,
                          bold: false,
                        },
                        {
                          icon: <Phone size={11} />,
                          val: order.customer.phoneNumber,
                          bold: false,
                        },
                        {
                          icon: <MapPin size={11} />,
                          val: order.customer.address,
                          bold: false,
                        },
                      ].map(({ icon, val, bold }, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 text-xs ${bold ? "font-semibold text-gray-800" : "text-gray-500"}`}
                        >
                          <span className="text-[#16a34a] mt-0.5 flex-shrink-0">
                            {icon}
                          </span>
                          {val}
                        </div>
                      ))}
                    </div>

                    {/* Items */}
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Items
                      </p>
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0"
                        >
                          <div className="shrink-0 w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                            <img
                              src={productImg(item)}
                              alt={item.product.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 leading-snug">
                              {item.product.title}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.color && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor: item.color.hexCode,
                                    }}
                                  />
                                  {item.color.name}
                                </span>
                              )}
                              <span className="text-[10px] text-[#16a34a] font-bold">
                                ×{item.quantity}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1.5">
                              <span className="text-[10px] text-gray-400">
                                {fmt(item.unitPrice)} each
                              </span>
                              <span className="text-xs font-bold text-gray-900">
                                {fmt(item.itemTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Transaction */}
                    {order.payment.transaction && (
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                          Transaction
                        </p>
                        <MethodBadge method={order.payment.method} />
                        <p className="text-[11px] font-mono text-gray-600 break-all mt-2 leading-relaxed">
                          {order.payment.transaction.transactionId}
                        </p>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Subtotal</span>
                        <span className="tabular-nums text-gray-700">
                          {fmt(order.summary.subtotal)}
                        </span>
                      </div>
                      {order.summary.discount.amount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span className="flex items-center gap-1">
                            <Tag size={10} />
                            {order.summary.discount.code}
                          </span>
                          <span className="tabular-nums">
                            -{fmt(order.summary.discount.amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200">
                        <span className="text-sm font-bold text-gray-800">
                          Total
                        </span>
                        <span className="text-lg font-black text-[#16a34a] tabular-nums">
                          {fmt(order.summary.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
