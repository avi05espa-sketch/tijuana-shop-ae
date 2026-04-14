import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useActorRef, useListUsers } from "@/hooks/use-backend";
import { UserRole, UserStatus, formatZone } from "@/types/marketplace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Copy, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function getSuspensionWhatsAppUrl(userName: string): string {
  const msg = `Hola Avi, mi cuenta en Tijuana Shop AE ha sido suspendida por un saldo pendiente de $50 MXN. Solicito los datos de pago para liquidar mi multa y reactivar mi perfil de inmediato. Mi nombre de usuario es: ${userName}`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

function getSuspensionMessage(userName: string): string {
  return `Hola Avi, mi cuenta en Tijuana Shop AE ha sido suspendida por un saldo pendiente de $50 MXN. Solicito los datos de pago para liquidar mi multa y reactivar mi perfil de inmediato. Mi nombre de usuario es: ${userName}`;
}
import type { UserProfile } from "../backend";

type StatusFilter = "all" | "active" | "suspended" | "inactive";
type RoleFilter = "all" | "admin" | "vendedor" | "comprador";
type VerifiedFilter = "all" | "si" | "no";
type SortField = "name" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.admin)
    return (
      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-xs">
        Admin
      </Badge>
    );
  if (role === UserRole.vendedor)
    return (
      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-xs">
        Vendedor
      </Badge>
    );
  return (
    <Badge className="bg-muted text-muted-foreground border-border text-xs">
      Comprador
    </Badge>
  );
}

function UserRow({ user }: { user: UserProfile }) {
  const { actor } = useActorRef();
  const qc = useQueryClient();

  const verifyMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No disponible");
      return actor.verifyUser(user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success(`Usuario ${user.name} verificado`);
    },
    onError: () => toast.error("Error al verificar usuario"),
  });

  const statusMut = useMutation({
    mutationFn: async (status: UserStatus) => {
      if (!actor) throw new Error("No disponible");
      return actor.updateUserStatus(user.id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success("Estado actualizado");
    },
    onError: () => toast.error("Error al actualizar estado"),
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No disponible");
      return actor.deleteUser(user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success(`Usuario ${user.name} eliminado`);
    },
    onError: () => toast.error("Error al eliminar usuario"),
  });

  const isSuspended =
    user.status === UserStatus.suspended || user.status === UserStatus.banned;
  const date = new Date(Number(user.createdAt) / 1_000_000).toLocaleDateString(
    "es-MX",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <tr
      className="border-b border-border hover:bg-muted/30 transition-colors"
      data-ocid={`admin-user-row-${user.id}`}
    >
      {/* Avatar + Nombre */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-accent text-xs font-bold">
                {user.name[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-sm font-medium truncate max-w-[140px]">
              {user.name}
            </p>
            <p className="text-muted-foreground text-xs truncate max-w-[140px]">
              {user.email ?? user.phone}
            </p>
            {user.zone && (
              <p className="text-muted-foreground text-xs">
                {formatZone(user.zone as Parameters<typeof formatZone>[0])}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-4 py-3">
        {isSuspended ? (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
            Suspendido
          </Badge>
        ) : (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
            Activo
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        {user.verified ? (
          <span className="text-green-400 text-sm">✓ Verificado</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
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
            <Link to="/vendedor/$id" params={{ id: user.id }}>
              Ver Perfil
            </Link>
          </Button>
          {!user.verified && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/10"
              onClick={() => verifyMut.mutate()}
              disabled={verifyMut.isPending}
              data-ocid={`admin-verify-${user.id}`}
            >
              Verificar ✓
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={`h-7 px-2 text-xs ${
              isSuspended
                ? "text-green-400 hover:bg-green-500/10"
                : "text-yellow-400 hover:bg-yellow-500/10"
            }`}
            onClick={() =>
              statusMut.mutate(
                isSuspended ? UserStatus.active : UserStatus.suspended,
              )
            }
            disabled={statusMut.isPending}
            data-ocid={`admin-toggle-status-${user.id}`}
          >
            {isSuspended ? "Activar" : "Suspender"}
          </Button>
          {isSuspended && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/10"
                onClick={() => {
                  window.open(getSuspensionWhatsAppUrl(user.name), "_blank");
                }}
                data-ocid={`admin-suspension-whatsapp-${user.id}`}
                title="Enviar mensaje de suspensión por WhatsApp"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:bg-muted/30"
                onClick={() => {
                  navigator.clipboard.writeText(
                    getSuspensionMessage(user.name),
                  );
                  toast.success("Mensaje copiado al portapapeles");
                }}
                data-ocid={`admin-suspension-copy-${user.id}`}
                title="Copiar mensaje de suspensión"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/10"
                data-ocid={`admin-delete-trigger-${user.id}`}
              >
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  ¿Eliminar usuario?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Esta acción es irreversible. Se eliminará la cuenta de{" "}
                  <strong className="text-foreground">{user.name}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-muted-foreground">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => deleteMut.mutate()}
                  data-ocid={`admin-delete-confirm-${user.id}`}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useListUsers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const result = users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.email?.toLowerCase().includes(q) ?? false);
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? u.status === UserStatus.active
            : u.status === UserStatus.suspended ||
              u.status === UserStatus.banned;
      const matchRole =
        roleFilter === "all" ? true : u.role === (roleFilter as UserRole);
      const matchVerified =
        verifiedFilter === "all"
          ? true
          : verifiedFilter === "si"
            ? u.verified
            : !u.verified;
      return matchSearch && matchStatus && matchRole && matchVerified;
    });

    result.sort((a, b) => {
      if (sortField === "name") {
        return sortDir === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      const aTime = Number(a.createdAt);
      const bTime = Number(b.createdAt);
      return sortDir === "asc" ? aTime - bTime : bTime - aTime;
    });
    return result;
  }, [
    users,
    search,
    statusFilter,
    roleFilter,
    verifiedFilter,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(0);
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 opacity-30">↕</span>;
    return (
      <span className="ml-1 text-accent">{sortDir === "asc" ? "↑" : "↓"}</span>
    );
  };

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "active", label: "Activos" },
    { id: "suspended", label: "Suspendidos" },
  ];

  return (
    <AdminLayout activeTab="usuarios">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="text-foreground font-medium">
              {filtered.length}
            </span>{" "}
            usuario{filtered.length !== 1 ? "s" : ""} encontrado
            {filtered.length !== 1 ? "s" : ""} de{" "}
            <span className="text-foreground font-medium">{users.length}</span>{" "}
            total
          </p>
        </div>

        {/* Filters Row 1 */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Input
            placeholder="Buscar por nombre, email o teléfono…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="bg-card border-input text-foreground w-full sm:max-w-xs"
            data-ocid="admin-users-search"
          />
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(0);
                }}
                className={`px-3 py-1.5 text-sm rounded-md transition-smooth ${
                  statusFilter === tab.id
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`admin-users-filter-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Row 2 */}
        <div className="flex flex-wrap gap-3">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as RoleFilter);
              setPage(0);
            }}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
            data-ocid="admin-users-role-filter"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="vendedor">Vendedor</option>
            <option value="comprador">Comprador</option>
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => {
              setVerifiedFilter(e.target.value as VerifiedFilter);
              setPage(0);
            }}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
            data-ocid="admin-users-verified-filter"
          >
            <option value="all">Verificación: todos</option>
            <option value="si">Verificados</option>
            <option value="no">No verificados</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="flex items-center hover:text-foreground select-none"
                    >
                      Nombre <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Verificado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <button
                      type="button"
                      onClick={() => toggleSort("createdAt")}
                      className="flex items-center hover:text-foreground select-none"
                    >
                      Registro <SortIcon field="createdAt" />
                    </button>
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
                        {["c0", "c1", "c2", "c3", "c4", "c5"].map((ck) => (
                          <td key={ck} className="px-4 py-3">
                            <Skeleton className="h-5 w-20 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : paginated.map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
              </tbody>
            </table>
            {!isLoading && filtered.length === 0 && (
              <div
                className="py-12 text-center text-muted-foreground"
                data-ocid="admin-users-empty"
              >
                <span className="text-4xl block mb-3">👥</span>
                <p>No se encontraron usuarios</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {page + 1} de {totalPages} · {filtered.length} usuarios
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs border-border"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  data-ocid="admin-users-prev"
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
                  data-ocid="admin-users-next"
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
