import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentUser,
  useDashboardStats,
  useListUsers,
} from "@/hooks/use-backend";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

function StatCard({
  label,
  value,
  color = "cyan",
  isLoading,
  icon,
}: {
  label: string;
  value: number | string;
  color?: "cyan" | "red" | "yellow" | "green" | "muted" | "purple";
  isLoading?: boolean;
  icon?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    green: "text-green-400",
    purple: "text-purple-400",
    muted: "text-muted-foreground",
  };
  const borderMap: Record<string, string> = {
    cyan: "border-cyan-500/20",
    red: "border-red-500/20",
    yellow: "border-yellow-500/20",
    green: "border-green-500/20",
    purple: "border-purple-500/20",
    muted: "border-border",
  };
  return (
    <div
      className={`bg-card border ${borderMap[color]} rounded-xl p-5 flex flex-col gap-2 hover:border-opacity-50 transition-smooth`}
    >
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span
              className={`font-display text-3xl font-bold ${colorMap[color]}`}
            >
              {value}
            </span>
            {icon && <span className="text-2xl opacity-60">{icon}</span>}
          </div>
          <span className="text-muted-foreground text-sm">{label}</span>
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, isLoading: userLoading } = useCurrentUser();
  const { data: stats, isLoading: statsLoading, refetch } = useDashboardStats();
  const { data: users = [], isLoading: usersLoading } = useListUsers();
  const navigate = useNavigate();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30_000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (!isAdmin && !userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <span className="text-5xl">🚫</span>
        <p className="font-display text-xl font-bold text-foreground">
          Acceso no autorizado
        </p>
        <p className="text-muted-foreground text-sm text-center">
          Solo administradores pueden ver este panel.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/" })}
          className="border-accent/40 text-accent hover:bg-accent/10"
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  const isLoading = statsLoading || userLoading;
  const pending = Number(stats?.pendingReports ?? 0);
  const totalUsers = users.length;

  // Calculate weekly new users (last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newUsersThisWeek = users.filter(
    (u) => Number(u.createdAt) / 1_000_000 >= sevenDaysAgo,
  ).length;

  // Verification rate
  const verifiedCount = users.filter((u) => u.verified).length;
  const verificationRate =
    totalUsers > 0 ? Math.round((verifiedCount / totalUsers) * 100) : 0;

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Dashboard
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Resumen general de la plataforma · Actualización automática cada
              30s
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-accent/30 text-accent hover:bg-accent/10 text-xs"
            data-ocid="admin-refresh-stats"
          >
            ↻ Actualizar
          </Button>
        </div>

        {/* Primary KPIs */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Usuarios
          </p>
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            data-ocid="admin-stats-grid"
          >
            <StatCard
              label="Total Usuarios"
              value={Number(stats?.totalUsers ?? totalUsers)}
              color="cyan"
              icon="👥"
              isLoading={isLoading || usersLoading}
            />
            <StatCard
              label="Nuevos Esta Semana"
              value={newUsersThisWeek}
              color="green"
              icon="🆕"
              isLoading={usersLoading}
            />
            <StatCard
              label="Nuevos Hoy"
              value={Number(stats?.newUsersToday ?? 0)}
              color="yellow"
              icon="📅"
              isLoading={isLoading}
            />
            <StatCard
              label="Tasa de Verificación"
              value={`${verificationRate}%`}
              color="purple"
              icon="✅"
              isLoading={usersLoading}
            />
          </div>
        </div>

        {/* Products & Reports KPIs */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Contenido y Reportes
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Listados Activos"
              value={Number(stats?.activeListings ?? 0)}
              color="cyan"
              icon="📦"
              isLoading={isLoading}
            />
            <StatCard
              label="Productos Bloqueados"
              value={Number(stats?.blockedProducts ?? 0)}
              color="red"
              icon="🚫"
              isLoading={isLoading}
            />
            <StatCard
              label="Total Reportes"
              value={Number(stats?.totalReports ?? 0)}
              color="muted"
              icon="📋"
              isLoading={isLoading}
            />
            <StatCard
              label="Reportes Pendientes"
              value={pending}
              color={pending > 0 ? "red" : "muted"}
              icon="🚨"
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Acciones Rápidas
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-smooth"
              data-ocid="admin-quick-usuarios"
            >
              <Link to="/admin/usuarios">👥 Ver Usuarios</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 transition-smooth"
              data-ocid="admin-quick-reportes"
            >
              <Link to="/admin/reportes">
                🚨 Ver Reportes
                {pending > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {pending}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground transition-smooth"
              data-ocid="admin-quick-auditoria"
            >
              <Link to="/admin/reportes">🔍 Ver Reportes</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground transition-smooth"
              data-ocid="admin-quick-productos"
            >
              <Link to="/admin/productos">📦 Ver Contenido</Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
