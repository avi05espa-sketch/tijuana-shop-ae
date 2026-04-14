import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

type AdminTab =
  | "dashboard"
  | "usuarios"
  | "productos"
  | "reportes"
  | "auditoria"
  | "configuracion";

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: AdminTab;
}

const tabs: { id: AdminTab; label: string; icon: string; path: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊", path: "/admin" },
  { id: "usuarios", label: "Usuarios", icon: "👥", path: "/admin/usuarios" },
  { id: "productos", label: "Contenido", icon: "📦", path: "/admin/productos" },
  { id: "reportes", label: "Reportes", icon: "🚨", path: "/admin/reportes" },
  { id: "auditoria", label: "Auditoría", icon: "🔍", path: "/admin/auditoria" },
  {
    id: "configuracion",
    label: "Configuración",
    icon: "⚙️",
    path: "/admin/configuracion",
  },
];

export function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useCurrentUser();

  function handleLogout() {
    clear();
    navigate({ to: "/" });
  }

  if (!isAdmin && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4">
        <span className="text-5xl">🚫</span>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Acceso no autorizado
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Solo administradores pueden acceder a este panel.
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          className="mt-2 bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-smooth"
          data-ocid="admin-unauthorized-home"
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-card border-b border-border sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-accent font-display font-bold text-lg">
                ⚡ Panel de Administración
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border text-muted-foreground hover:text-foreground hover:border-destructive hover:text-destructive transition-smooth"
              data-ocid="admin-logout"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:flex flex-col w-52 shrink-0">
            <nav className="bg-card border border-border rounded-xl p-3 space-y-1 sticky top-32">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                    activeTab === tab.id
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  data-ocid={`admin-nav-${tab.id}`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Tab bar — mobile */}
          <div className="lg:hidden overflow-x-auto pb-1">
            <nav className="flex gap-1 min-w-max bg-card border border-border rounded-xl p-1.5">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth ${
                    activeTab === tab.id
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  data-ocid={`admin-tab-${tab.id}`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
