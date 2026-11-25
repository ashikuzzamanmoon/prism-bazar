"use client";

import { Order } from "@/types/orderTypes";
import React, { useRef, useState } from "react";
import domtoimage from "dom-to-image";
import jsPDF from "jspdf";
import { Loader2 } from "lucide-react";

// ─── Formatters ───────────────────────────────────────────────────────────────

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

const getProductImage = (item: any) => {
  const images = item.product?.images;
  if (images && images.length > 0) {
    const primary = images.find((img: any) => img.isPrimary);
    const img = primary || images[0];
    if (img?.url && !img.url.includes("example.com")) return img.url;
  }
  return "/OneFv.jpg";
};

// ─── Status badge (UI only — for the visible invoice card) ───────────────────

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

// ─── Invoice status pill (inline styles — used inside the hidden PDF div) ─────

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

// ─── PDF Invoice template (100% inline styles, always 768px) ─────────────────

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
          src="/OneFv.jpg"
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
            Bashundhara, Dhaka
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
            color: "#ff7200",
            letterSpacing: "-1px",
            lineHeight: 1.1,
          }}
        >
          #{order.traxId}
        </div>
        <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>
          {formatDate(order.invoiceDate)}
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
        background: "linear-gradient(to right, #ff7200, #ff944d, #ff7200)",
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
              background: "#ff7200",
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
                stroke="#ff7200"
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
              background: "#ff7200",
              display: "inline-block",
            }}
          />
          Payment Details
        </div>
        {/* Table layout — prevents "Cash on Delivery" from overlapping status pill */}
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
                    {formatDate(order.payment.transaction.date)}
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
            background: "#ff7200",
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
                    color: "#ff7200",
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
                      src={getProductImage(item)}
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
                            color: "#ff7200",
                            fontWeight: 600,
                          }}
                        >
                          {opt.group.title}: {opt.value}
                          {opt.extraPrice > 0 && (
                            <span
                              style={{ color: "#ff944d", marginLeft: "3px" }}
                            >
                              +{formatCurrency(opt.extraPrice)}
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
                {formatCurrency(item.unitPrice)}
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
                {formatCurrency(item.itemTotal)}
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
            {formatCurrency(order.summary.subtotal)}
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
                    color: "#ff7200",
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
              -{formatCurrency(order.summary.discount.amount)}
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
              color: "#ff7200",
              letterSpacing: "-0.5px",
            }}
          >
            {formatCurrency(order.summary.total)}
          </span>
        </div>
      </div>
    </div>

    {/* Footer — marginTop: auto keeps it at the bottom of the flex column */}
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
          src="/OneFv.jpg"
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
          {formatDate(order.timestamps.createdAt)}
        </span>
      </div>
    </div>
  </div>
);

// ─── PDF helpers ──────────────────────────────────────────────────────────────

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

const generatePdf = async (
  el: HTMLDivElement,
  traxId: string,
): Promise<void> => {
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
    // Capture at 2× pixel density for sharp/crisp output
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

// ─── Main Component ───────────────────────────────────────────────────────────

const OrderSuccess = ({ invoiceData }: { invoiceData: Order }) => {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    if (!hiddenRef.current) return;
    setGenerating(true);
    try {
      await generatePdf(hiddenRef.current, invoiceData.traxId);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Hidden off-screen div — fixed 768px, used for PDF capture only */}
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
        <div
          ref={hiddenRef}
          style={{
            width: "768px",
            minWidth: "768px",
            minHeight: "1056px",
            background: "#ffffff",
            overflow: "visible",
          }}
        >
          <InvoiceTemplate order={invoiceData} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-5 bg-white p-3">
        {/* ── Success Banner ── */}
        <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5 border border-gray-100 border-l-4 border-l-emerald-500">
          <div className="shrink-0 w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l4 4L19 7"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">
              Order Placed Successfully!
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              A confirmation has been sent to{" "}
              <span className="text-[#ff7200] font-semibold">
                {invoiceData?.customer?.email}
              </span>
            </p>
          </div>
          <div className="ml-auto hidden sm:block text-right">
            <p className="text-xs text-gray-400">Order ID</p>
            <p className="text-xl font-black text-[#ff7200] tracking-tight">
              #{invoiceData?.traxId}
            </p>
          </div>
        </div>

        {/* ── Invoice Card (visible UI — unchanged) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 px-8 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <img
                src="/OneFv.jpg"
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
                  Bashundhara, Dhaka
                </p>
              </div>
            </div>
            <div className="sm:text-right space-y-1">
              <p className="text-[10px] font-bold tracking-[2px] text-gray-400 uppercase">
                Invoice
              </p>
              <p className="text-3xl font-black text-[#ff7200] tracking-tight">
                #{invoiceData?.traxId}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(invoiceData?.invoiceDate)}
              </p>
              <div className="flex sm:justify-end gap-2 flex-wrap pt-1">
                <StatusBadge status={invoiceData?.status} />
                <StatusBadge status={invoiceData?.paymentStatus} />
              </div>
            </div>
          </div>

          {/* Orange gradient bar */}
          <div className="h-1 bg-gradient-to-r from-[#ff7200] via-[#ff944d] to-[#ff7200]" />

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {/* Bill To */}
            <div className="px-8 py-6">
              <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff7200] inline-block" />
                Bill To
              </p>
              <p className="text-base font-bold text-gray-900 mb-3">
                {invoiceData?.customer?.name}
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
                  {invoiceData?.customer?.email}
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
                  {invoiceData?.customer?.phoneNumber}
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
                  {invoiceData?.customer?.address}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="px-8 py-6">
              <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff7200] inline-block" />
                Payment Details
              </p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    Method
                  </span>
                  <span className="text-xs font-semibold text-gray-800 text-right">
                    {invoiceData?.payment?.method?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    Status
                  </span>
                  <StatusBadge status={invoiceData?.payment?.status} />
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">
                    Transaction ID
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-gray-700 text-right break-all">
                    {invoiceData?.payment?.transaction?.transactionId}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    Payment Date
                  </span>
                  <span className="text-xs font-semibold text-gray-800 text-right">
                    {formatDate(invoiceData?.payment?.transaction?.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="mx-8 border-t border-dashed border-gray-200" />

          {/* Items */}
          <div className="px-8 py-6">
            <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff7200] inline-block" />
              Order Items
            </p>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="text-left text-[10px] font-bold tracking-widest uppercase text-[#ff7200] px-4 py-3 rounded-l-xl">
                      Product
                    </th>
                    <th className="text-center text-[10px] font-bold tracking-widest uppercase text-[#ff7200] px-4 py-3">
                      Qty
                    </th>
                    <th className="text-center text-[10px] font-bold tracking-widest uppercase text-[#ff7200] px-4 py-3">
                      Unit Price
                    </th>
                    <th className="text-right text-[10px] font-bold tracking-widest uppercase text-[#ff7200] px-4 py-3 rounded-r-xl">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-50 ${idx % 2 === 1 ? "bg-gray-50/60" : ""}`}
                    >
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 w-16 h-16 bg-white rounded-md border border-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={getProductImage(item)}
                              alt={item.product.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs leading-relaxed mb-2 max-w-xs">
                              {item.product.title}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.color && (
                                <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2 py-0.5 text-[11px] text-gray-600 font-medium">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0"
                                    style={{
                                      backgroundColor: item?.color?.hexCode,
                                    }}
                                  />
                                  {item?.color?.name}
                                </span>
                              )}
                              {item.options.map((opt) => (
                                <span
                                  key={opt.id}
                                  className="inline-flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-md px-2 py-0.5 text-[11px] text-[#ff7200] font-semibold"
                                >
                                  {opt.group.title}: {opt.value}
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
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-gray-800 align-middle">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600 font-medium align-middle">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-4 text-right font-extrabold text-gray-900 align-middle">
                        {formatCurrency(item.itemTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="px-8 pb-8">
            <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatCurrency(invoiceData.summary.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    Discount
                    {invoiceData.summary.discount.code && (
                      <span className="text-[10px] font-bold bg-orange-100 text-[#ff7200] px-2 py-0.5 rounded-md">
                        {invoiceData.summary.discount.code}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-sm font-semibold ${invoiceData.summary.discount.amount > 0 ? "text-emerald-600" : "text-gray-400"}`}
                  >
                    {invoiceData.summary.discount.amount > 0
                      ? `-${formatCurrency(invoiceData.summary.discount.amount)}`
                      : "—"}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-[#ff7200] tracking-tight">
                    {formatCurrency(invoiceData.summary.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-orange-50 border-t border-orange-100 px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/OneFv.jpg"
                alt="Prism Bazar Logo"
                width={200}
                height={60}
                className="w-6 sm:w-8 md:w-8 lg:w-8 h-auto object-contain"
              />
              <div>
                <p className="text-sm font-extrabold text-gray-900">Prism Bazar</p>
                <p className="text-[10px] text-gray-400">
                  Thank you for your purchase!
                </p>
              </div>
            </div>
            <div className="sm:text-right text-xs text-gray-400 space-y-0.5">
              <p>
                Order placed:{" "}
                <span className="font-semibold text-gray-600">
                  {formatDate(invoiceData.timestamps.createdAt)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
          <button
            onClick={handleDownloadPdf}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#ff7200] text-[#ff7200] font-bold text-sm hover:bg-orange-50 transition-colors disabled:opacity-60"
          >
            {generating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            )}
            {generating ? "Generating…" : "Print Invoice"}
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff7200] hover:bg-[#ff944d] text-white font-bold text-sm shadow-md shadow-orange-200 transition-colors"
          >
            Continue Shopping
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
