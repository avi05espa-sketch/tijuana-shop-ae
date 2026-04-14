import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActorRef } from "@/hooks/use-backend";
import { ReportStatus, ReportType } from "@/types/marketplace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Report } from "../backend";

type ReportFilter = "all" | "new" | "inReview" | "resolved";

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  if (status === ReportStatus.new_)
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
        🆕 Nuevo
      </Badge>
    );
  if (status === ReportStatus.inReview)
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 text-xs">
        🔍 En Revisión
      </Badge>
    );
  return (
    <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
      ✅ Resuelto
    </Badge>
  );
}

function ReportTypeIcon({ type }: { type: ReportType }) {
  if (type === ReportType.product) return <span title="Producto">📦</span>;
  if (type === ReportType.user) return <span title="Usuario">👤</span>;
  return <span title="Chat">💬</span>;
}

function ReportRow({ report }: { report: Report }) {
  const { actor } = useActorRef();
  const qc = useQueryClient();
  const [noteDialog, setNoteDialog] = useState(false);
  const [resolveDialog, setResolveDialog] = useState(false);
  const [note, setNote] = useState("");

  const updateStatusMut = useMutation({
    mutationFn: async (status: ReportStatus) => {
      if (!actor) throw new Error("No disponible");
      return actor.updateReportStatus(report.id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Estado del reporte actualizado");
      setResolveDialog(false);
    },
    onError: () => toast.error("Error al actualizar reporte"),
  });

  const addNoteMut = useMutation({
    mutationFn: async (n: string) => {
      if (!actor) throw new Error("No disponible");
      return actor.addAdminNote(report.id, n);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Nota agregada");
      setNoteDialog(false);
      setNote("");
    },
    onError: () => toast.error("Error al agregar nota"),
  });

  const date = new Date(
    Number(report.createdAt) / 1_000_000,
  ).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const entityPath =
    report.reportType === ReportType.product
      ? `/producto/${report.entityId}`
      : `/vendedor/${report.entityId}`;

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/30 transition-colors"
        data-ocid={`admin-report-row-${report.id}`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <ReportTypeIcon type={report.reportType} />
            <span className="text-muted-foreground capitalize text-xs">
              {report.reportType === ReportType.product
                ? "Producto"
                : report.reportType === ReportType.user
                  ? "Usuario"
                  : "Chat"}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <Link
            to={
              report.reportType === ReportType.product
                ? "/producto/$id"
                : "/vendedor/$id"
            }
            params={{ id: report.entityId }}
            className="text-accent text-xs hover:underline"
          >
            {report.entityId.slice(0, 10)}…
          </Link>
        </td>
        <td className="px-4 py-3 text-muted-foreground text-xs">
          {report.reporterId.slice(0, 10)}…
        </td>
        <td className="px-4 py-3 text-foreground text-sm max-w-[200px]">
          <p className="truncate">{report.reason}</p>
          {report.description && (
            <p className="text-muted-foreground text-xs mt-0.5 truncate">
              {report.description}
            </p>
          )}
        </td>
        <td className="px-4 py-3">
          <ReportStatusBadge status={report.status} />
        </td>
        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
          {date}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-accent hover:bg-accent/10"
            >
              <a href={entityPath}>Ver entidad</a>
            </Button>
            {report.status === ReportStatus.new_ && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-yellow-400 hover:bg-yellow-500/10"
                onClick={() => updateStatusMut.mutate(ReportStatus.inReview)}
                disabled={updateStatusMut.isPending}
                data-ocid={`admin-review-${report.id}`}
              >
                Iniciar Revisión
              </Button>
            )}
            {report.status !== ReportStatus.resolved && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/10"
                onClick={() => setResolveDialog(true)}
                data-ocid={`admin-resolve-trigger-${report.id}`}
              >
                Marcar Resuelto
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={() => setNoteDialog(true)}
              data-ocid={`admin-note-trigger-${report.id}`}
            >
              Agregar Nota
            </Button>
          </div>
        </td>
      </tr>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialog} onOpenChange={setResolveDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              ¿Marcar como resuelto?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            El reporte se marcará como resuelto. Puedes agregar una nota
            opcional antes de cerrar.
          </p>
          <Textarea
            placeholder="Nota de resolución (opcional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-background border-input text-foreground resize-none"
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialog(false)}
              className="border-border text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (note.trim()) await addNoteMut.mutateAsync(note.trim());
                updateStatusMut.mutate(ReportStatus.resolved);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={updateStatusMut.isPending || addNoteMut.isPending}
              data-ocid={`admin-resolve-confirm-${report.id}`}
            >
              Confirmar Resolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Agregar Nota</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Escribe una nota administrativa…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-background border-input text-foreground resize-none"
            rows={4}
            data-ocid={`admin-note-input-${report.id}`}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNoteDialog(false);
                setNote("");
              }}
              className="border-border text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => note.trim() && addNoteMut.mutate(note.trim())}
              className="bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30"
              disabled={addNoteMut.isPending || !note.trim()}
              data-ocid={`admin-note-save-${report.id}`}
            >
              Guardar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminReportsPage() {
  const { actor, isFetching } = useActorRef();
  const [statusFilter, setStatusFilter] = useState<ReportFilter>("all");

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listReports();
    },
    enabled: !!actor && !isFetching,
  });

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "new") return r.status === ReportStatus.new_;
      if (statusFilter === "inReview")
        return r.status === ReportStatus.inReview;
      return r.status === ReportStatus.resolved;
    });
  }, [reports, statusFilter]);

  const newCount = reports.filter((r) => r.status === ReportStatus.new_).length;

  const filterTabs: { id: ReportFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "new", label: `🆕 Nuevos${newCount > 0 ? ` (${newCount})` : ""}` },
    { id: "inReview", label: "🔍 En Revisión" },
    { id: "resolved", label: "✅ Resueltos" },
  ];

  return (
    <AdminLayout activeTab="reportes">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Gestión de Reportes
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} reporte{filtered.length !== 1 ? "s" : ""}{" "}
            encontrado{filtered.length !== 1 ? "s" : ""}
            {newCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs rounded-full px-2 py-0.5">
                {newCount} pendiente{newCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto w-fit"
          data-ocid="admin-reports-filters"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-smooth whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`admin-reports-filter-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Entidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Reportador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Razón
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? ["r0", "r1", "r2", "r3", "r4"].map((rk) => (
                      <tr key={rk} className="border-b border-border">
                        {["c0", "c1", "c2", "c3", "c4", "c5", "c6"].map(
                          (ck) => (
                            <td key={ck} className="px-4 py-3">
                              <Skeleton className="h-5 w-20 rounded" />
                            </td>
                          ),
                        )}
                      </tr>
                    ))
                  : filtered.map((report) => (
                      <ReportRow key={report.id} report={report} />
                    ))}
              </tbody>
            </table>
            {!isLoading && filtered.length === 0 && (
              <div
                className="py-12 text-center text-muted-foreground"
                data-ocid="admin-reports-empty"
              >
                <span className="text-4xl block mb-3">🚨</span>
                <p>No se encontraron reportes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
