import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useActorRef } from "@/hooks/use-backend";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AuditLog } from "../backend";

const PAGE_SIZE = 50;

function AuditStatusBadge({ status }: { status: string }) {
  if (status === "success")
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
        ✓ Éxito
      </Badge>
    );
  if (status === "error")
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
        ✗ Error
      </Badge>
    );
  return (
    <Badge className="bg-muted text-muted-foreground border-border text-xs">
      {status}
    </Badge>
  );
}

const ACTION_TYPES = [
  "all",
  "user.delete",
  "user.status",
  "user.verify",
  "product.delete",
  "product.status",
  "product.feature",
  "report.status",
  "report.note",
  "config.update",
] as const;

type ActionType = (typeof ACTION_TYPES)[number];

function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportCsv(logs: AuditLog[]) {
  const header = [
    "ID",
    "Administrador",
    "Acción",
    "Detalles",
    "Fecha",
    "Estado",
  ];
  const rows = logs.map((log) => [
    log.id,
    log.adminName,
    log.action,
    log.details.replace(/"/g, '""'),
    formatTimestamp(log.timestamp),
    log.status,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([`\ufeff${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `auditoria_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminAuditPage() {
  const { actor, isFetching } = useActorRef();
  const [actionFilter, setActionFilter] = useState<ActionType>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listAuditLogs({
        page: BigInt(0),
        pageSize: BigInt(500),
      });
      return result;
    },
    enabled: !!actor && !isFetching,
  });

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchAction =
        actionFilter === "all" ? true : log.action === actionFilter;

      const logDate = new Date(Number(log.timestamp) / 1_000_000);
      const matchFrom = fromDate
        ? logDate >= new Date(`${fromDate}T00:00:00`)
        : true;
      const matchTo = toDate ? logDate <= new Date(`${toDate}T23:59:59`) : true;

      return matchAction && matchFrom && matchTo;
    });
  }, [logs, actionFilter, fromDate, toDate]);

  // Sort by date desc
  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)),
    [filtered],
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <AdminLayout activeTab="auditoria">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Registro de Auditoría
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="text-foreground font-medium">
                {filtered.length}
              </span>{" "}
              registro{filtered.length !== 1 ? "s" : ""} encontrado
              {filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv(sorted)}
            disabled={sorted.length === 0}
            className="border-accent/30 text-accent hover:bg-accent/10 text-xs"
            data-ocid="audit-export-csv"
          >
            ↓ Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value as ActionType);
              setPage(0);
            }}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
            data-ocid="audit-action-filter"
          >
            <option value="all">Todas las acciones</option>
            <option value="user.delete">Eliminar usuario</option>
            <option value="user.status">Cambio estado usuario</option>
            <option value="user.verify">Verificar usuario</option>
            <option value="product.delete">Eliminar producto</option>
            <option value="product.status">Cambio estado producto</option>
            <option value="product.feature">Destacar producto</option>
            <option value="report.status">Actualizar reporte</option>
            <option value="report.note">Nota en reporte</option>
            <option value="config.update">Actualizar configuración</option>
          </select>

          <div className="flex items-center gap-2">
            <label
              htmlFor="audit-from-date"
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              Desde
            </label>
            <Input
              id="audit-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
              className="bg-card border-input text-foreground w-36 text-sm"
              data-ocid="audit-from-date"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="audit-to-date"
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              Hasta
            </label>
            <Input
              id="audit-to-date"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
              className="bg-card border-input text-foreground w-36 text-sm"
              data-ocid="audit-to-date"
            />
          </div>

          {(actionFilter !== "all" || fromDate || toDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActionFilter("all");
                setFromDate("");
                setToDate("");
                setPage(0);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar filtros ✕
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Administrador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Detalles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Fecha y Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? ["r0", "r1", "r2", "r3", "r4", "r5"].map((rk) => (
                      <tr key={rk} className="border-b border-border">
                        {["c0", "c1", "c2", "c3", "c4"].map((ck) => (
                          <td key={ck} className="px-4 py-3">
                            <Skeleton className="h-5 w-24 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : paginated.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                        data-ocid={`audit-log-row-${log.id}`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-foreground text-sm font-medium">
                            {log.adminName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {log.adminId.slice(0, 8)}…
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-accent text-xs bg-accent/10 px-2 py-0.5 rounded font-mono">
                            {log.action}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-[280px]">
                          <p className="truncate">{log.details}</p>
                          {log.affectedId && (
                            <p className="text-muted-foreground/60 text-xs mt-0.5">
                              ID: {log.affectedId.slice(0, 12)}…
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <AuditStatusBadge status={log.status} />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && sorted.length === 0 && (
              <div
                className="py-12 text-center text-muted-foreground"
                data-ocid="audit-empty"
              >
                <span className="text-4xl block mb-3">🔍</span>
                <p>No hay registros de auditoría</p>
                {(actionFilter !== "all" || fromDate || toDate) && (
                  <p className="text-xs mt-1">Prueba ajustar los filtros</p>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {page + 1} de {totalPages} · {sorted.length} registros
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs border-border"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  data-ocid="audit-prev"
                >
                  ← Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs border-border"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  data-ocid="audit-next"
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
