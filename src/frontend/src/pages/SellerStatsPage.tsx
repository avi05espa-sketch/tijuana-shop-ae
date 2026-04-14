import type { TopProduct } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentUser,
  useGetSellerOrderStats,
  useGetSellerStats,
} from "@/hooks/use-backend";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMXN(value: bigint | number): string {
  const num = typeof value === "bigint" ? Number(value) : value;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", { month: "short", day: "numeric" });
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string;
  value: string;
  icon: string;
  isLoading?: boolean;
}) {
  return (
    <div
      className="relative bg-[#1a1a2e] rounded-xl border-t-2 border-t-cyan-400 border border-cyan-500/20
        p-5 flex flex-col gap-3 hover:border-cyan-400/40 transition-smooth glow-cyan-hover"
    >
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-24 rounded bg-cyan-900/30" />
          <Skeleton className="h-4 w-32 rounded bg-cyan-900/20" />
        </>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <span className="font-display text-3xl font-bold text-cyan-400 leading-none">
              {value}
            </span>
            <span className="text-2xl opacity-70">{icon}</span>
          </div>
          <span className="text-sm text-muted-foreground">{label}</span>
        </>
      )}
    </div>
  );
}

// ─── Mini Order Card ─────────────────────────────────────────────────────────
function OrderPeriodCard({
  label,
  count,
  isLoading,
}: {
  label: string;
  count: number;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-1 text-center">
      {isLoading ? (
        <>
          <Skeleton className="h-7 w-12 rounded bg-cyan-900/30" />
          <Skeleton className="h-3 w-16 rounded bg-cyan-900/20 mt-1" />
        </>
      ) : (
        <>
          <span className="font-display text-2xl font-bold text-cyan-400">
            {count}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </>
      )}
    </div>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-cyan-500/30 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-cyan-400">
        Ingresos: {formatMXN(payload[0].value)} MXN
      </p>
    </div>
  );
}

// ─── Sort types ───────────────────────────────────────────────────────────────
type SortKey = "title" | "views" | "orders" | "revenue" | "conversion";
type SortDir = "asc" | "desc";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SellerStatsPage() {
  const navigate = useNavigate();
  const { isVendor, isLoading: userLoading } = useCurrentUser();
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
    isError: statsError,
  } = useGetSellerStats();
  const {
    data: orderStats,
    isLoading: orderLoading,
    refetch: refetchOrders,
    isError: orderError,
  } = useGetSellerOrderStats();

  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Role guard
  useEffect(() => {
    if (!userLoading && !isVendor) {
      navigate({ to: "/perfil" });
    }
  }, [isVendor, userLoading, navigate]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchOrders();
    }, 30_000);
    return () => clearInterval(interval);
  }, [refetchStats, refetchOrders]);

  const isLoading = statsLoading || orderLoading || userLoading;
  const hasError = statsError || orderError;

  // Chart data
  const chartData = (stats?.revenueByDay ?? []).map((d) => ({
    date: formatDate(d.date),
    revenue: Number(d.revenue),
  }));

  // Sorted products
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortedProducts: TopProduct[] = [...(stats?.topProducts ?? [])].sort(
    (a, b) => {
      let aVal: number;
      let bVal: number;
      if (sortKey === "title") {
        return sortDir === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortKey === "conversion") {
        const convA =
          Number(a.views) > 0 ? (Number(a.orders) / Number(a.views)) * 100 : 0;
        const convB =
          Number(b.views) > 0 ? (Number(b.orders) / Number(b.views)) * 100 : 0;
        aVal = convA;
        bVal = convB;
      } else {
        aVal = Number(a[sortKey as keyof TopProduct]);
        bVal = Number(b[sortKey as keyof TopProduct]);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    },
  );

  function SortHeader({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k;
    return (
      <th
        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-cyan-400 transition-smooth select-none whitespace-nowrap"
        onClick={() => handleSort(k)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSort(k)}
        scope="col"
        data-ocid={`sort-${k}`}
      >
        {label}
        {active && (
          <span className="ml-1 text-cyan-400">
            {sortDir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </th>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────────
  if (hasError && !isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4"
        data-ocid="seller-stats-error"
      >
        <span className="text-5xl">📉</span>
        <p className="font-display text-xl font-bold text-foreground">
          Error al cargar estadísticas
        </p>
        <p className="text-muted-foreground text-sm text-center">
          No se pudieron obtener tus datos. Intenta de nuevo.
        </p>
        <button
          type="button"
          onClick={() => {
            refetchStats();
            refetchOrders();
          }}
          className="mt-2 px-4 py-2 border border-cyan-500/40 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/10 transition-smooth"
          data-ocid="seller-stats-retry"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6 space-y-8"
      data-ocid="seller-stats-page"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Mis Estadísticas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Resumen de tu actividad como vendedor · Auto-actualización cada 30s
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            refetchStats();
            refetchOrders();
          }}
          className="flex-shrink-0 px-3 py-1.5 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs hover:bg-cyan-500/10 transition-smooth"
          data-ocid="seller-stats-refresh"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Métricas Principales
        </p>
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          data-ocid="seller-kpi-grid"
        >
          <KpiCard
            label="Ingresos Totales"
            value={isLoading ? "—" : formatMXN(stats?.totalRevenue ?? 0n)}
            icon="💰"
            isLoading={isLoading}
          />
          <KpiCard
            label="Total Órdenes"
            value={isLoading ? "—" : String(Number(stats?.totalOrders ?? 0n))}
            icon="📦"
            isLoading={isLoading}
          />
          <KpiCard
            label="Valor Promedio"
            value={isLoading ? "—" : formatMXN(stats?.avgOrderValue ?? 0n)}
            icon="📊"
            isLoading={isLoading}
          />
          <KpiCard
            label="Tasa de Conversión"
            value={
              isLoading
                ? "—"
                : `${((stats?.conversionRate ?? 0) * 100).toFixed(1)}%`
            }
            icon="🎯"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Revenue Chart */}
      <section className="bg-card border border-border rounded-xl p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          Ingresos de los últimos 30 días
        </h2>
        {isLoading ? (
          <Skeleton className="h-52 w-full rounded-lg bg-cyan-900/20" />
        ) : chartData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
            Sin datos de ingresos disponibles aún.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 24 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                interval="preserveStartEnd"
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#00FFFF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#00FFFF", stroke: "#00FFFF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Order Period Cards */}
      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Resumen de Órdenes
        </p>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          data-ocid="seller-orders-grid"
        >
          <OrderPeriodCard
            label="Hoy"
            count={Number(orderStats?.ordersToday ?? 0n)}
            isLoading={isLoading}
          />
          <OrderPeriodCard
            label="Esta semana"
            count={Number(orderStats?.ordersThisWeek ?? 0n)}
            isLoading={isLoading}
          />
          <OrderPeriodCard
            label="Este mes"
            count={Number(orderStats?.ordersThisMonth ?? 0n)}
            isLoading={isLoading}
          />
          <OrderPeriodCard
            label="Total"
            count={Number(orderStats?.totalOrders ?? 0n)}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Product Performance Table */}
      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Rendimiento por Producto
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Haz clic en los encabezados para ordenar
          </p>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {["sk1", "sk2", "sk3"].map((skId) => (
              <Skeleton
                key={skId}
                className="h-10 w-full rounded bg-cyan-900/20"
              />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4"
            data-ocid="seller-products-empty"
          >
            <span className="text-4xl opacity-50">📦</span>
            <p className="text-muted-foreground text-sm">
              Aún no tienes productos con actividad.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="seller-products-table">
              <thead className="bg-muted/30">
                <tr>
                  <SortHeader k="title" label="Producto" />
                  <SortHeader k="views" label="Vistas" />
                  <SortHeader k="orders" label="Órdenes" />
                  <SortHeader k="revenue" label="Ingresos (MXN)" />
                  <SortHeader k="conversion" label="Conversión %" />
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p, idx) => {
                  const conv =
                    Number(p.views) > 0
                      ? ((Number(p.orders) / Number(p.views)) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <tr
                      key={p.productId}
                      className={`border-t border-border hover:bg-muted/20 transition-smooth ${
                        idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                      }`}
                      data-ocid={`product-row-${p.productId}`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground max-w-[180px]">
                        <span className="block truncate" title={p.title}>
                          {p.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {Number(p.views).toLocaleString("es-MX")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {Number(p.orders).toLocaleString("es-MX")}
                      </td>
                      <td className="px-4 py-3 text-cyan-400 font-semibold tabular-nums">
                        {formatMXN(p.revenue)}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            Number(conv) >= 5
                              ? "bg-green-500/20 text-green-400"
                              : Number(conv) >= 2
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {conv}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
