import { NotificationBell } from "@/components/NotificationBell";
import { OfficialLogo } from "@/components/OfficialLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useUnreadCount } from "@/hooks/use-backend";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  Heart,
  Home,
  LogOut,
  MapPin,
  MessageCircle,
  Plus,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { PlusCircle } from "lucide-react";

export function Navbar() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { user, isVendor } = useCurrentUser();
  const router = useRouter();
  const { data: unreadCount } = useUnreadCount();

  const isAuthenticated = !!identity;
  const unread = Number(unreadCount ?? BigInt(0));

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: "/" });
  };

  const handleLogin = () => {
    router.navigate({ to: "/login" });
  };

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/mapa", label: "Mapa" },
    { to: "/puntos-entrega", label: "Entrega Segura" },
    ...(isVendor ? [{ to: "/publicar", label: "Vender" }] : []),
  ];

  return (
    <>
      {/* ── Desktop / Top Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-card border-b"
        style={{ borderBottomColor: "rgba(0,255,255,0.2)" }}
        data-ocid="navbar"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            data-ocid="navbar-logo"
          >
            <OfficialLogo
              size={40}
              className="shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <span
              className="font-display font-bold text-lg tracking-tight text-foreground"
              style={{
                letterSpacing: "-0.02em",
                textShadow: "0 0 20px rgba(0,255,255,0.4)",
              }}
            >
              Tijuana <span style={{ color: "#00FFFF" }}>Shop AE</span>
            </span>
          </Link>

          {/* Desktop Nav — hidden on mobile (<768px) */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isVendor && (
              <Link
                to="/mis-estadisticas"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                activeProps={{ className: "text-foreground font-medium" }}
                data-ocid="navbar-stats-link"
              >
                Mis Estadísticas
              </Link>
            )}
          </nav>

          {/* Desktop Auth — hidden on mobile (<768px) */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogin}
                  data-ocid="navbar-login-btn"
                  className="border-accent/30 text-accent hover:border-accent/60 hover:text-accent"
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  onClick={handleLogin}
                  data-ocid="navbar-register-btn"
                  style={{
                    background: "rgba(0,255,255,0.15)",
                    border: "1px solid rgba(0,255,255,0.4)",
                    color: "#00FFFF",
                  }}
                  className="hover:bg-accent/20 transition-smooth"
                >
                  Registrarme
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Chat icon with unread badge */}
                <Link
                  to="/chat"
                  className="relative p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Mensajes"
                  data-ocid="navbar-chat-btn"
                >
                  <MessageCircle className="w-5 h-5" />
                  {unread > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-background"
                      style={{ background: "#00FFFF" }}
                      data-ocid="navbar-unread-badge"
                    >
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </Link>
                <NotificationBell />
                <UserMenu
                  user={user}
                  isVendor={isVendor}
                  onLogout={handleLogout}
                />
              </div>
            )}
          </div>

          {/* Mobile: compact auth area (login button only if not authenticated) */}
          {!isAuthenticated && (
            <Button
              size="sm"
              onClick={handleLogin}
              className="md:hidden"
              data-ocid="navbar-mobile-login-btn"
              style={{
                background: "rgba(0,255,255,0.15)",
                border: "1px solid rgba(0,255,255,0.4)",
                color: "#00FFFF",
              }}
            >
              Entrar
            </Button>
          )}
          {isAuthenticated && (
            <div className="md:hidden flex items-center gap-1">
              <UserMenu
                user={user}
                isVendor={isVendor}
                onLogout={handleLogout}
              />
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── visible only on mobile (<768px) */}
      <MobileBottomNav
        isAuthenticated={isAuthenticated}
        unread={unread}
        onLogin={handleLogin}
      />
    </>
  );
}

// ─── Mobile Bottom Navigation ─────────────────────────────────────────────────
interface MobileBottomNavProps {
  isAuthenticated: boolean;
  unread: number;
  onLogin: () => void;
}

function MobileBottomNav({
  isAuthenticated,
  unread,
  onLogin,
}: MobileBottomNavProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const activeStyle = {
    color: "#00FFFF",
    filter: "drop-shadow(0 0 6px rgba(0,255,255,0.7))",
  };
  const inactiveStyle = { color: "rgba(255,255,255,0.45)" };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16"
      style={{
        background: "#1a1a1a",
        borderTop: "1px solid rgba(0,255,255,0.18)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
      aria-label="Navegación principal"
      data-ocid="mobile-bottom-nav"
    >
      {/* Inicio */}
      <Link
        to="/"
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[48px] min-h-[44px] justify-center"
        data-ocid="bottomnav-home"
        aria-label="Inicio"
      >
        <Home
          className="w-5 h-5"
          style={isActive("/") ? activeStyle : inactiveStyle}
        />
        <span
          className="text-[10px] font-medium"
          style={
            isActive("/")
              ? { color: "#00FFFF" }
              : { color: "rgba(255,255,255,0.45)" }
          }
        >
          Inicio
        </span>
        {isActive("/") && (
          <div
            className="absolute -bottom-0 w-8 h-0.5 rounded-full"
            style={{ background: "#00FFFF" }}
          />
        )}
      </Link>

      {/* Explorar / Mapa */}
      <Link
        to="/mapa"
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[48px] min-h-[44px] justify-center"
        data-ocid="bottomnav-mapa"
        aria-label="Explorar mapa"
      >
        <MapPin
          className="w-5 h-5"
          style={isActive("/mapa") ? activeStyle : inactiveStyle}
        />
        <span
          className="text-[10px] font-medium"
          style={
            isActive("/mapa")
              ? { color: "#00FFFF" }
              : { color: "rgba(255,255,255,0.45)" }
          }
        >
          Explorar
        </span>
        {isActive("/mapa") && (
          <div
            className="absolute -bottom-0 w-8 h-0.5 rounded-full"
            style={{ background: "#00FFFF" }}
          />
        )}
      </Link>

      {/* Vender — center CTA (all users can sell) */}
      {isAuthenticated ? (
        <Link
          to="/publicar"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[48px] min-h-[44px] justify-center relative"
          data-ocid="bottomnav-vender"
          aria-label="Publicar producto"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center -mt-5 shadow-lg transition-smooth"
            style={{
              background: isActive("/publicar")
                ? "#00FFFF"
                : "rgba(0,255,255,0.85)",
              boxShadow: "0 0 16px rgba(0,255,255,0.5)",
            }}
          >
            <Plus className="w-5 h-5" style={{ color: "#0a0a0a" }} />
          </div>
          <span
            className="text-[10px] font-medium"
            style={
              isActive("/publicar")
                ? { color: "#00FFFF" }
                : { color: "rgba(255,255,255,0.45)" }
            }
          >
            Vender
          </span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={onLogin}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[48px] min-h-[44px] justify-center relative"
          data-ocid="bottomnav-vender-cta"
          aria-label="Empezar a vender"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center -mt-5 shadow-lg"
            style={{
              background: "rgba(0,255,255,0.2)",
              border: "1.5px dashed rgba(0,255,255,0.5)",
            }}
          >
            <Plus className="w-5 h-5" style={{ color: "#00FFFF" }} />
          </div>
          <span
            className="text-[10px] font-medium"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Vender
          </span>
        </button>
      )}

      {/* Mensajes */}
      {isAuthenticated ? (
        <Link
          to="/chat"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[48px] min-h-[44px] justify-center relative"
          data-ocid="bottomnav-chat"
          aria-label="Mensajes"
        >
          <div className="relative">
            <MessageCircle
              className="w-5 h-5"
              style={isActive("/chat") ? activeStyle : inactiveStyle}
            />
            {unread > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: "#00FFFF", color: "#0a0a0a" }}
                data-ocid="bottomnav-unread-badge"
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
          <span
            className="text-[10px] font-medium"
            style={
              isActive("/chat")
                ? { color: "#00FFFF" }
                : { color: "rgba(255,255,255,0.45)" }
            }
          >
            Mensajes
          </span>
          {isActive("/chat") && (
            <div
              className="absolute -bottom-0 w-8 h-0.5 rounded-full"
              style={{ background: "#00FFFF" }}
            />
          )}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onLogin}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[48px] min-h-[44px] justify-center"
          data-ocid="bottomnav-chat-guest"
          aria-label="Mensajes"
        >
          <MessageCircle className="w-5 h-5" style={inactiveStyle} />
          <span
            className="text-[10px] font-medium"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Mensajes
          </span>
        </button>
      )}

      {/* Perfil */}
      {isAuthenticated ? (
        <Link
          to="/perfil"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[48px] min-h-[44px] justify-center"
          data-ocid="bottomnav-perfil"
          aria-label="Mi perfil"
        >
          <User
            className="w-5 h-5"
            style={isActive("/perfil") ? activeStyle : inactiveStyle}
          />
          <span
            className="text-[10px] font-medium"
            style={
              isActive("/perfil")
                ? { color: "#00FFFF" }
                : { color: "rgba(255,255,255,0.45)" }
            }
          >
            Perfil
          </span>
          {isActive("/perfil") && (
            <div
              className="absolute -bottom-0 w-8 h-0.5 rounded-full"
              style={{ background: "#00FFFF" }}
            />
          )}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onLogin}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[48px] min-h-[44px] justify-center"
          data-ocid="bottomnav-perfil-guest"
          aria-label="Iniciar sesión"
        >
          <User className="w-5 h-5" style={inactiveStyle} />
          <span
            className="text-[10px] font-medium"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Entrar
          </span>
        </button>
      )}
    </nav>
  );
}

// ─── User Menu (desktop) ──────────────────────────────────────────────────────
function UserMenu({
  user,
  isVendor,
  onLogout,
}: {
  user: import("../../backend").UserProfile | null;
  isVendor: boolean;
  onLogout: () => void;
}) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TJ";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-full pr-3 pl-1 py-1 transition-smooth",
            "border hover:border-accent/40",
          )}
          style={{ borderColor: "rgba(0,255,255,0.2)" }}
          data-ocid="navbar-user-menu-trigger"
        >
          <Avatar className="w-7 h-7">
            {user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            )}
            <AvatarFallback
              className="text-xs font-medium"
              style={{ background: "rgba(0,255,255,0.15)", color: "#00FFFF" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
            {user?.name ? `¡Hola, ${user.name.split(" ")[0]}!` : "¡Hola!"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        <DropdownMenuItem asChild>
          <Link
            to="/perfil"
            className="flex items-center gap-2 cursor-pointer"
            data-ocid="navbar-profile-link"
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/configuracion"
            className="flex items-center gap-2 cursor-pointer"
            data-ocid="navbar-settings-link"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/favoritos"
            className="flex items-center gap-2 cursor-pointer"
            data-ocid="navbar-favorites-link"
          >
            <Heart className="w-4 h-4" />
            Mis Favoritos
          </Link>
        </DropdownMenuItem>
        {isVendor && (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/publicar"
                className="flex items-center gap-2 cursor-pointer"
                data-ocid="navbar-publish-link"
              >
                <PlusCircle className="w-4 h-4" />
                Vender
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/mis-estadisticas"
                className="flex items-center gap-2 cursor-pointer"
                data-ocid="navbar-stats-dropdown-link"
              >
                <BarChart2 className="w-4 h-4" />
                Mis Estadísticas
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem asChild>
          <Link
            to="/mapa"
            className="flex items-center gap-2 cursor-pointer"
            data-ocid="navbar-map-link"
          >
            <MapPin className="w-4 h-4" />
            Mapa
          </Link>
        </DropdownMenuItem>
        {user?.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/admin"
                className="flex items-center gap-2 cursor-pointer"
                data-ocid="navbar-admin-link"
                style={{ color: "#ff6400" }}
              >
                <Shield className="w-4 h-4" />
                Panel de Admin
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2 text-destructive cursor-pointer"
          data-ocid="navbar-logout-btn"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
