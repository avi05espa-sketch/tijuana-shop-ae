import { ProductCard } from "@/components/ui/ProductCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useActorRef,
  useCurrentUser,
  useProductsByVendor,
} from "@/hooks/use-backend";
import { ProductZone, UserRole, formatZone } from "@/types/marketplace";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronRight,
  Lock,
  LogOut,
  Package,
  Pencil,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ZONES = [
  { value: ProductZone.playas, label: "Playas de Tijuana" },
  { value: ProductZone.otay, label: "Otay" },
  { value: ProductZone.centro, label: "Centro Histórico" },
  { value: ProductZone.corredor2000, label: "Corredor 2000" },
];

function formatDate(ts: bigint): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleDateString("es-MX", { year: "numeric", month: "long" });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadge(role: UserRole) {
  if (role === UserRole.admin)
    return {
      label: "Administrador",
      style: {
        background: "rgba(255,100,0,0.2)",
        color: "#ff6400",
        border: "1px solid rgba(255,100,0,0.4)",
      },
    };
  if (role === UserRole.vendedor)
    return {
      label: "Vendedor",
      style: {
        background: "rgba(0,255,255,0.12)",
        color: "#00FFFF",
        border: "1px solid rgba(0,255,255,0.35)",
      },
    };
  return {
    label: "Comprador",
    style: {
      background: "rgba(255,255,255,0.07)",
      color: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(255,255,255,0.15)",
    },
  };
}

// ─── Quick Links ──────────────────────────────────────────────────────────────
function QuickLink({
  href,
  icon,
  label,
  sub,
}: { href: string; icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-smooth hover:border-accent/40"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      data-ocid={`profile-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: "rgba(0,255,255,0.7)" }}>{icon}</span>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </Link>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  const { isInitializing, clear } = useInternetIdentity();
  const { actor } = useActorRef();
  const queryClient = useQueryClient();

  const isVendor =
    user?.role === UserRole.vendedor || user?.role === UserRole.admin;
  const { data: myProducts = [], isLoading: loadingProducts } =
    useProductsByVendor(isVendor && user ? user.id : "");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    bio: "",
    zona: "",
    correo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Stored mode toggle
  const [adminMode, setAdminMode] = useState<"admin" | "user">(() => {
    try {
      return (localStorage.getItem("adminMode") as "admin" | "user") ?? "user";
    } catch {
      return "user";
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) navigate({ to: "/login" });
  }, [isInitializing, isAuthenticated, navigate]);

  // Populate form when user loads
  useEffect(() => {
    if (user)
      setForm({
        nombre: user.name ?? "",
        telefono: user.phone ?? "",
        bio: user.bio ?? "",
        zona: user.zone ?? "",
        correo: user.email ?? "",
      });
  }, [user]);

  function validate() {
    const e: Record<string, string> = {};
    if (form.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres.";
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = "Correo inválido.";
    if (form.bio.length > 300) e.bio = "Máximo 300 caracteres.";
    return e;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      if (!actor) throw new Error("Sin conexión");
      await actor.updateProfile(
        form.nombre.trim() || null,
        form.correo || null,
        null,
        form.bio || null,
        form.zona || null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      );
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Perfil actualizado correctamente.");
      setEditing(false);
    } catch {
      toast.error("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clear();
    queryClient.clear();
    toast.success("Sesión cerrada. ¡Hasta pronto!");
    navigate({ to: "/" });
  }

  function handleAdminToggle() {
    if (adminMode === "user") {
      localStorage.setItem("adminMode", "admin");
      setAdminMode("admin");
      navigate({ to: "/admin" });
    } else {
      localStorage.setItem("adminMode", "user");
      setAdminMode("user");
      navigate({ to: "/" });
    }
  }

  if (isInitializing || isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) return null;

  const roleBadge = getRoleBadge(user.role);
  const isAdmin = user.role === UserRole.admin;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-6 pb-24">
      {/* ── Profile Header ── */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(0,255,255,0.15)",
        }}
        data-ocid="profile-header"
      >
        <div className="relative">
          <Avatar
            className="w-20 h-20 shrink-0"
            style={{ border: "2px solid rgba(0,255,255,0.35)" }}
          >
            {user.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            )}
            <AvatarFallback
              className="text-xl font-bold"
              style={{ background: "rgba(0,255,255,0.1)", color: "#00FFFF" }}
            >
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display font-bold text-xl text-foreground truncate">
              {user.name}
            </h1>
            {user.verified && (
              <span title="Verificado" style={{ color: "#00FFFF" }}>
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={roleBadge.style}
              data-ocid="profile-role-badge"
            >
              {roleBadge.label}
            </span>
            {user.zone && (
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground"
              >
                📍 {formatZone(user.zone as ProductZone)}
              </Badge>
            )}
          </div>
          {user.bio ? (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {user.bio}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Sin descripción. ¡Agrega una para generar confianza!
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => setEditing((v) => !v)}
          data-ocid="profile-edit-btn"
        >
          {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          {editing ? "Cancelar" : "Editar"}
        </Button>
      </div>

      {/* ── Admin Dual Mode Toggle ── */}
      {isAdmin && (
        <div
          className="flex items-center justify-between gap-4 p-4 rounded-xl"
          style={{
            background:
              adminMode === "admin"
                ? "rgba(255,100,0,0.1)"
                : "rgba(255,100,0,0.07)",
            border: "1.5px solid rgba(255,100,0,0.35)",
          }}
          data-ocid="admin-mode-toggle-card"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(255,100,0,0.15)",
                border: "1px solid rgba(255,100,0,0.3)",
              }}
            >
              <Shield className="w-5 h-5" style={{ color: "#ff6400" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#ff6400" }}>
                {adminMode === "admin"
                  ? "Modo Administrador Activo"
                  : "Panel de Administración"}
              </p>
              <p className="text-xs text-muted-foreground">
                {adminMode === "admin"
                  ? "Estás viendo la vista de admin"
                  : "Gestiona usuarios, productos y reportes"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleAdminToggle}
            size="sm"
            className="gap-1.5 shrink-0 font-semibold"
            style={{
              background:
                adminMode === "admin"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,100,0,0.2)",
              border: "1px solid rgba(255,100,0,0.5)",
              color: "#ff6400",
            }}
            data-ocid="admin-mode-toggle-btn"
          >
            <Shield className="w-4 h-4" />
            {adminMode === "admin"
              ? "Cambiar a Modo Usuario"
              : "Ir al Panel Admin"}
          </Button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4" data-ocid="profile-stats">
        {[
          {
            icon: <Package className="w-5 h-5" />,
            value: Number(user.totalSales).toString(),
            label: "Ventas totales",
          },
          {
            icon: <Star className="w-5 h-5" />,
            value: user.avgRating > 0 ? user.avgRating.toFixed(1) : "—",
            label: "Calificación",
          },
          {
            icon: <CalendarDays className="w-5 h-5" />,
            value: formatDate(user.createdAt),
            label: "Miembro desde",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span style={{ color: "rgba(0,255,255,0.7)" }}>{stat.icon}</span>
            <span className="font-display font-bold text-lg text-foreground leading-tight">
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Quick Links ── */}
      <div className="flex flex-col gap-2" data-ocid="profile-quick-links">
        <h2 className="text-sm font-semibold text-muted-foreground px-1 mb-1">
          Acceso rápido
        </h2>
        <QuickLink
          href="/configuracion"
          icon={<Settings className="w-5 h-5" />}
          label="Configuración"
          sub="Identidad, seguridad y preferencias"
        />
        {isVendor && (
          <QuickLink
            href="/mis-estadisticas"
            icon={<Star className="w-5 h-5" />}
            label="Mis Estadísticas"
            sub="Ver ventas e ingresos"
          />
        )}
        <QuickLink
          href="/publicar"
          icon={<Package className="w-5 h-5" />}
          label="Publicar Producto"
          sub="Crear una nueva publicación"
        />
      </div>

      {/* ── Edit Form ── */}
      {editing && (
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-4 p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(0,255,255,0.15)",
          }}
          data-ocid="profile-edit-form"
        >
          <h2
            className="font-display font-semibold text-base"
            style={{ color: "#00FFFF" }}
          >
            Editar perfil
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pf-nombre">Nombre completo</Label>
              <Input
                id="pf-nombre"
                value={form.nombre}
                onChange={(e) => {
                  setForm((f) => ({ ...f, nombre: e.target.value }));
                  setErrors((er) =>
                    Object.fromEntries(
                      Object.entries(er).filter(([k]) => k !== "nombre"),
                    ),
                  );
                }}
                className={errors.nombre ? "border-destructive" : ""}
                data-ocid="pf-nombre-input"
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pf-telefono">Teléfono</Label>
              <Input
                id="pf-telefono"
                value={form.telefono}
                readOnly
                className="opacity-60 cursor-not-allowed"
                data-ocid="pf-telefono-input"
              />
              <p className="text-xs text-muted-foreground">
                El teléfono no puede cambiarse.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pf-correo">Correo electrónico</Label>
              <Input
                id="pf-correo"
                type="email"
                value={form.correo}
                onChange={(e) => {
                  setForm((f) => ({ ...f, correo: e.target.value }));
                  setErrors((er) =>
                    Object.fromEntries(
                      Object.entries(er).filter(([k]) => k !== "correo"),
                    ),
                  );
                }}
                placeholder="tu@correo.com"
                className={errors.correo ? "border-destructive" : ""}
                data-ocid="pf-correo-input"
              />
              {errors.correo && (
                <p className="text-xs text-destructive">{errors.correo}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pf-zona">Zona en Tijuana</Label>
              <select
                id="pf-zona"
                value={form.zona}
                onChange={(e) =>
                  setForm((f) => ({ ...f, zona: e.target.value }))
                }
                className="h-10 rounded-lg px-3 text-sm bg-card border border-border text-foreground outline-none focus:ring-2 transition-smooth"
                data-ocid="pf-zona-select"
              >
                <option value="">Seleccionar zona</option>
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-bio">
              Descripción{" "}
              <span className="text-muted-foreground font-normal text-xs">
                ({form.bio.length}/300)
              </span>
            </Label>
            <Textarea
              id="pf-bio"
              value={form.bio}
              onChange={(e) => {
                setForm((f) => ({ ...f, bio: e.target.value }));
                setErrors((er) =>
                  Object.fromEntries(
                    Object.entries(er).filter(([k]) => k !== "bio"),
                  ),
                );
              }}
              placeholder="Cuéntanos brevemente quién eres, qué vendes o en qué zona de Tijuana sueles entregar. ¡Esto genera confianza!"
              rows={3}
              maxLength={300}
              className={errors.bio ? "border-destructive" : ""}
              data-ocid="pf-bio-textarea"
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio}</p>
            )}
          </div>

          <Button
            type="submit"
            className="self-start gap-2 font-semibold"
            style={{ background: "#00FFFF", color: "#0a0a0a" }}
            disabled={saving}
            data-ocid="pf-save-btn"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] animate-spin" />
                Guardando...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </form>
      )}

      {/* ── Vendor Products ── */}
      {isVendor && (
        <section
          className="flex flex-col gap-4"
          data-ocid="vendor-products-section"
        >
          <h2 className="font-display font-semibold text-lg text-foreground">
            Mis Publicaciones
            {!loadingProducts && myProducts.length > 0 && (
              <span className="ml-2 text-muted-foreground text-sm font-normal">
                ({myProducts.length})
              </span>
            )}
          </h2>

          {loadingProducts && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((id) => (
                <div
                  key={id}
                  className="rounded-xl overflow-hidden border border-border bg-card"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-3 flex flex-col gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingProducts && myProducts.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
              data-ocid="vendor-products-empty"
            >
              <span className="text-4xl">📦</span>
              <p className="font-semibold text-foreground">
                No tienes publicaciones activas
              </p>
              <p className="text-sm text-muted-foreground">
                Empieza a vender publicando tu primer producto.
              </p>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/publicar" })}
                style={{ background: "#00FFFF", color: "#0a0a0a" }}
                data-ocid="vendor-publish-cta"
              >
                Publicar producto
              </Button>
            </div>
          )}

          {!loadingProducts && myProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {myProducts.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} seller={user} />
                  {product.isApartado && (
                    <span
                      className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: "rgba(255,165,0,0.2)",
                        border: "1px solid rgba(255,165,0,0.5)",
                        color: "#FFA500",
                        backdropFilter: "blur(4px)",
                      }}
                      data-ocid="product-apartado-badge"
                    >
                      <Lock className="w-2.5 h-2.5" /> Apartado
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Logout ── */}
      <div
        className="pt-4 border-t"
        style={{ borderTopColor: "rgba(255,255,255,0.07)" }}
      >
        <Button
          variant="destructive"
          className="gap-2"
          onClick={handleLogout}
          data-ocid="logout-btn"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
