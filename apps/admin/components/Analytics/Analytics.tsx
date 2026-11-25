"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  BarChart2,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useGetDashboardAnalyticsQuery } from "@/redux/Api/analyticsApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Summary {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: string;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 1_000_000
    ? `৳${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `৳${(n / 1_000).toFixed(0)}K`
      : `৳${n}`;

const fmtFull = (n: number) => `৳${Number(n).toLocaleString("en-BD")}`;

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  sub?: string;
}) => (
  <div className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <div
      className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] -translate-y-6 translate-x-6"
      style={{ background: accent }}
    />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
    </div>
  </div>
);

// ─── Transaction Card ─────────────────────────────────────────────────────────

const TxCard = ({
  success,
  failed,
  pending,
}: {
  success: number;
  failed: number;
  pending: number;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
      Transactions
    </p>
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-gray-600">Successful</span>
        </div>
        <span className="text-sm font-semibold text-emerald-600">
          {success}
        </span>
      </div>
      <div className="h-px bg-gray-50" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-rose-400" />
          <span className="text-sm text-gray-600">Failed</span>
        </div>
        <span className="text-sm font-semibold text-rose-500">{failed}</span>
      </div>
      <div className="h-px bg-gray-50" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <span className="text-sm font-semibold text-amber-500">{pending}</span>
      </div>
    </div>
  </div>
);

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label, isRevenue }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {isRevenue ? fmtFull(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const ORDER_COLORS: Record<string, string> = {
  CONFIRMED: "#10b981",
  PENDING: "#f59e0b",
  CANCELLED: "#f43f5e",
};

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: "#10b981",
  FAILED: "#f43f5e",
  PENDING: "#f59e0b",
};

const DonutChart = ({
  data,
  colors,
}: {
  data: { name: string; value: number }[];
  colors: Record<string, string>;
}) => {
  const RADIAN = Math.PI / 180;
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={colors[entry.name] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600 capitalize">
              {value.toLowerCase()}
            </span>
          )}
        />
        <Tooltip
          formatter={(val: any, name: any) => [val ?? 0, name]}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #f1f5f9",
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ─── Breakdown Card ───────────────────────────────────────────────────────────

const BreakdownCard = ({
  title,
  items,
  colors,
}: {
  title: string;
  items: { name: string; value: number }[];
  colors: Record<string, string>;
}) => {
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-full">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </p>
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: colors[item.name] ?? "#94a3b8" }}
                  />
                  <span className="text-xs text-gray-600 capitalize">
                    {item.name.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-800">
                    {item.value}
                  </span>
                  <span className="text-xs text-gray-400">({pct}%)</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: colors[item.name] ?? "#94a3b8",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Total: <span className="font-semibold text-gray-600">{total}</span>
      </p>
    </div>
  );
};

// ─── Top Products ─────────────────────────────────────────────────────────────

const TopProducts = ({ products }: { products: any[] }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
      Top Products
    </p>
    <div className="flex flex-col gap-3">
      {products.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
            {i + 1}
          </span>
          <img
            src={p.image}
            alt={p.title}
            className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">
              {p.title}
            </p>
            <p className="text-xs text-gray-400">
              {fmtFull(Number(p.price))} · {p.sold} sold
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Recent Orders ────────────────────────────────────────────────────────────

const statusBadge: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-rose-50 text-rose-600",
  SUCCESS: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-rose-50 text-rose-600",
};

const RecentOrders = ({ orders }: { orders: any[] }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
      Recent Orders
    </p>
    <div className="flex flex-col gap-2">
      {orders.map((o) => (
        <div
          key={o.id}
          className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
            {o.customerName?.[0] ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">
              {o.customerName}
            </p>
            <p className="text-xs text-gray-400">#{o.traxId}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-semibold text-gray-800">
              {fmtFull(Number(o.amount))}
            </p>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadge[o.orderStatus] ?? "bg-gray-100 text-gray-500"}`}
            >
              {o.orderStatus}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Analytics Component ─────────────────────────────────────────────────

const Analytics = () => {
  const { data: res, isLoading } = useGetDashboardAnalyticsQuery({});
  const [activeChart, setActiveChart] = useState<"orders" | "revenue">(
    "orders",
  );
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400 text-sm gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-primary animate-spin" />
        Loading analytics...
      </div>
    );
  }

  const d = res?.data;
  if (!d) return null;

  const {
    summary,
    orderAnalysis,
    monthlyOrderTrend,
    monthlyRevenueTrend,
    topProducts,
    recentOrders,
    promoCodeAnalysis,
  } = d;

  // chart data
  const chartData =
    activeChart === "orders"
      ? monthlyOrderTrend.data.map((m: any) => ({
          name: m.displayMonth,
          value: m.count,
        }))
      : monthlyRevenueTrend.data.map((m: any) => ({
          name: m.displayMonth,
          value: m.revenue,
        }));

  const orderPieData = orderAnalysis.byStatus.map((s: any) => ({
    name: s.status,
    value: s.count,
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* ── Row 1: Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Revenue"
          value={fmt(Number(summary.totalRevenue))}
          icon={TrendingUp}
          accent="#6366f1"
          sub={fmtFull(Number(summary.totalRevenue))}
        />
        <StatCard
          label="Total Orders"
          value={summary.totalOrders}
          icon={ShoppingBag}
          accent="#f59e0b"
        />
        <StatCard
          label="Total Users"
          value={summary.totalUsers}
          icon={Users}
          accent="#10b981"
        />
        <StatCard
          label="Total Products"
          value={summary.totalProducts}
          icon={Package}
          accent="#3b82f6"
        />
        <StatCard
          label="Promo Used"
          value={promoCodeAnalysis.totalUsed}
          icon={Tag}
          accent="#ec4899"
        />
      </div>

      {/* ── Row 2: Transactions card + chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <TxCard
          success={summary.successfulTransactions}
          failed={summary.failedTransactions}
          pending={summary.pendingTransactions}
        />

        {/* Chart card */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(["orders", "revenue"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChart(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeChart === tab
                      ? "bg-white shadow text-gray-800"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab === "orders" ? "Monthly Orders" : "Monthly Revenue"}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setChartType("line")}
                className={`p-1.5 rounded-lg transition-all ${chartType === "line" ? "bg-white shadow" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LineChartIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`p-1.5 rounded-lg transition-all ${chartType === "bar" ? "bg-white shadow" : "text-gray-400 hover:text-gray-600"}`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            {chartType === "line" ? (
              <LineChart
                data={chartData}
                margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    activeChart === "revenue"
                      ? (v) => `${v / 1000}K`
                      : undefined
                  }
                />
                <Tooltip
                  content={
                    <ChartTooltip isRevenue={activeChart === "revenue"} />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#6366f1" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    activeChart === "revenue"
                      ? (v) => `${v / 1000}K`
                      : undefined
                  }
                />
                <Tooltip
                  content={
                    <ChartTooltip isRevenue={activeChart === "revenue"} />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Donut + Breakdown + Top Products ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Donut */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Order Status
          </p>
          <DonutChart data={orderPieData} colors={ORDER_COLORS} />
        </div>

        {/* Breakdown */}
        <BreakdownCard
          title="Order Breakdown"
          items={orderPieData}
          colors={ORDER_COLORS}
        />

        {/* Top Products */}
        <TopProducts products={topProducts} />
      </div>

      {/* ── Row 4: Recent orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOrders orders={recentOrders} />

        {/* Payment analysis */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Payment Analysis
          </p>
          <DonutChart
            data={d.paymentAnalysis.byStatus.map((s: any) => ({
              name: s.status,
              value: s.count,
            }))}
            colors={PAYMENT_COLORS}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
