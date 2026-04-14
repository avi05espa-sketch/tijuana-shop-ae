import type { ProductFilters } from "@/backend";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard } from "@/components/ui/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-backend";
import {
  ProductCategory,
  ProductCondition,
  ProductZone,
  formatCategory,
} from "@/types/marketplace";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Lock,
  RefreshCw,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SECRET_KEYWORD = "aviAdmin2024";
const ADMIN_PASSWORD = "TijuanaShopAE#2024";

// ─── Zone config ─────────────────────────────────────────────────────────────
const ZONES = [
  {
    zone: ProductZone.playas,
    label: "Playas de Tijuana",
    emoji: "🌊",
    desc: "Electrónicos, surf, ropa costera",
  },
  {
    zone: ProductZone.otay,
    label: "Otay",
    emoji: "🏭",
    desc: "Herramientas, maquinaria, industria",
  },
  {
    zone: ProductZone.centro,
    label: "Centro Histórico",
    emoji: "🏛️",
    desc: "Artesanías, ropa, antigüedades",
  },
  {
    zone: ProductZone.corredor2000,
    label: "Corredor 2000",
    emoji: "🏙️",
    desc: "Tecnología, autos, servicios",
  },
];

const CATEGORIES = [
  { value: "", label: "Todas las categorías" },
  ...Object.values(ProductCategory).map((v) => ({
    value: v,
    label: formatCategory(v),
  })),
];

const PAGE_SIZE = 12;

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-3 flex flex-col gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// ─── Intermediary Disclaimer Banner ──────────────────────────────────────────
function IntermediaryBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("intermediary-banner-dismissed") === "1",
  );
  if (dismissed) return null;
  return (
    <div
      className="px-4 py-3"
      style={{
        background: "rgba(0,255,255,0.04)",
        borderBottom: "1px solid rgba(0,255,255,0.15)",
      }}
      data-ocid="intermediary-banner"
    >
      <div className="max-w-5xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
          <Shield
            className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0"
            style={{ color: "#00FFFF" }}
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong style={{ color: "rgba(255,255,255,0.75)" }}>
              Tijuana Shop AE
            </strong>{" "}
            es solo un intermediario y no se hace responsable por los tratos
            directos entre usuarios.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("intermediary-banner-dismissed", "1");
            setDismissed(true);
          }}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar aviso"
          data-ocid="intermediary-banner-close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Update Banner ───────────────────────────────────────────────────────────
function UpdateBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("update-banner-dismissed") === "1",
  );
  if (dismissed) return null;
  return (
    <div
      className="px-4 py-3"
      style={{
        background: "rgba(0,80,80,0.35)",
        borderBottom: "1px solid rgba(0,255,255,0.2)",
      }}
      data-ocid="update-banner"
    >
      <div className="max-w-5xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
          <Bot
            className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0"
            style={{ color: "#00FFFF" }}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: "rgba(0,255,255,0.9)" }}
          >
            <RefreshCw className="inline w-3 h-3 mr-1 mb-0.5" />
            Este menú está en constante actualización, enfocándose en la
            facilidad de uso móvil y la integración de herramientas de
            inteligencia artificial para agilizar la publicación en 2025 y 2026.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("update-banner-dismissed", "1");
            setDismissed(true);
          }}
          className="shrink-0 p-1 rounded-md transition-colors"
          aria-label="Cerrar aviso"
          style={{ color: "rgba(0,255,255,0.6)" }}
          data-ocid="update-banner-close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── HomePage ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, string>;

  const q = search.q ?? "";
  const categoria = (search.categoria as ProductCategory) || "";
  const estado = (search.estado as ProductCondition) || "";
  const zona = (search.zona as ProductZone) || "";
  const precioMin = search.precioMin ? Number(search.precioMin) : undefined;
  const precioMax = search.precioMax ? Number(search.precioMax) : undefined;

  const [searchDraft, setSearchDraft] = useState(q);
  const [page, setPage] = useState(1);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  // Keep draft in sync when URL changes
  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

  const filters: ProductFilters = useMemo(() => {
    const f: ProductFilters = {};
    if (q) f.searchTerm = q;
    if (categoria) f.category = categoria;
    if (estado) f.condition = estado;
    if (zona) f.zone = zona;
    if (precioMin !== undefined) f.priceMin = precioMin;
    if (precioMax !== undefined) f.priceMax = precioMax;
    return f;
  }, [q, categoria, estado, zona, precioMin, precioMax]);

  const { data: allProducts = [], isLoading } = useProducts(filters);

  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const products = allProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function pushSearch(params: Record<string, string>) {
    setPage(1);
    navigate({
      to: "/",
      search: (prev) => ({ ...(prev as Record<string, string>), ...params }),
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchDraft.trim() === SECRET_KEYWORD) {
      setAdminPassword("");
      setAdminError("");
      setAdminModalOpen(true);
      return;
    }
    pushSearch({ q: searchDraft });
  }

  function handleAdminPasswordSubmit() {
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminModalOpen(false);
      setSearchDraft("");
      navigate({ to: "/admin" });
    } else {
      setAdminError("Contraseña incorrecta");
    }
  }

  function handleAdminModalClose() {
    setAdminModalOpen(false);
    setAdminPassword("");
    setAdminError("");
    setSearchDraft("");
  }

  function setFilter(key: string, value: string) {
    pushSearch({ [key]: value });
  }

  function handleZoneCard(zone: ProductZone) {
    pushSearch({ zona: zona === zone ? "" : zone });
  }

  return (
    <div className="flex flex-col">
      {/* ── Banners ──────────────────────────────────────────────────────── */}
      <UpdateBanner />
      <IntermediaryBanner />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative py-16 md:py-24 px-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,255,255,0.06) 0%, rgba(10,10,10,0) 100%)",
          borderBottom: "1px solid rgba(0,255,255,0.08)",
        }}
        data-ocid="hero-section"
      >
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-4">
          <h1
            className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight"
            style={{ textShadow: "0 0 40px rgba(0,255,255,0.15)" }}
          >
            Compra y vende <span style={{ color: "#00FFFF" }}>en Tijuana</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            El marketplace local más confiable de la ciudad
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 mt-2"
            data-ocid="hero-search-form"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Buscar productos en Tijuana..."
                className="pl-9 rounded-xl bg-card border-border focus:ring-2 text-foreground placeholder:text-muted-foreground h-12"
                style={
                  searchDraft
                    ? { borderColor: "rgba(0,255,255,0.4)" }
                    : undefined
                }
                data-ocid="hero-search-input"
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-6 rounded-xl font-semibold"
              style={{ background: "#00FFFF", color: "#0a0a0a" }}
              data-ocid="hero-search-btn"
            >
              Buscar
            </Button>
          </form>

          {/* Filter row */}
          <div
            className="flex flex-wrap gap-2 justify-center mt-1"
            data-ocid="filter-row"
          >
            <select
              value={categoria}
              onChange={(e) => setFilter("categoria", e.target.value)}
              className="h-9 rounded-full px-3 text-sm bg-card border text-foreground outline-none cursor-pointer"
              style={{
                borderColor: categoria
                  ? "rgba(0,255,255,0.5)"
                  : "rgba(255,255,255,0.12)",
                color: categoria ? "#00FFFF" : undefined,
              }}
              data-ocid="filter-categoria"
              aria-label="Filtrar por categoría"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {(
              [
                { value: "", label: "Todos" },
                { value: ProductCondition.nuevo, label: "Nuevo" },
                { value: ProductCondition.usado, label: "Usado" },
              ] as { value: string; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter("estado", opt.value)}
                className="h-9 rounded-full px-4 text-sm font-medium transition-smooth border"
                style={{
                  background:
                    estado === opt.value
                      ? "rgba(0,255,255,0.15)"
                      : "transparent",
                  borderColor:
                    estado === opt.value
                      ? "rgba(0,255,255,0.5)"
                      : "rgba(255,255,255,0.12)",
                  color: estado === opt.value ? "#00FFFF" : undefined,
                }}
                data-ocid={`filter-estado-${opt.value || "todos"}`}
              >
                {opt.label}
              </button>
            ))}

            <input
              type="number"
              placeholder="$ Mín"
              value={precioMin ?? ""}
              min={0}
              onChange={(e) => setFilter("precioMin", e.target.value)}
              className="h-9 w-24 rounded-full px-3 text-sm bg-card border text-foreground outline-none"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
              data-ocid="filter-precio-min"
              aria-label="Precio mínimo"
            />
            <input
              type="number"
              placeholder="$ Máx"
              value={precioMax ?? ""}
              min={0}
              onChange={(e) => setFilter("precioMax", e.target.value)}
              className="h-9 w-24 rounded-full px-3 text-sm bg-card border text-foreground outline-none"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
              data-ocid="filter-precio-max"
              aria-label="Precio máximo"
            />

            <select
              value={zona}
              onChange={(e) => setFilter("zona", e.target.value)}
              className="h-9 rounded-full px-3 text-sm bg-card border text-foreground outline-none cursor-pointer"
              style={{
                borderColor: zona
                  ? "rgba(0,255,255,0.5)"
                  : "rgba(255,255,255,0.12)",
                color: zona ? "#00FFFF" : undefined,
              }}
              data-ocid="filter-zona"
              aria-label="Filtrar por zona"
            >
              <option value="">Todas las zonas</option>
              {ZONES.map((z) => (
                <option key={z.zone} value={z.zone}>
                  {z.emoji} {z.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Hero Carousel ─────────────────────────────────────────────── */}
      <section className="px-4 py-6" data-ocid="hero-carousel-section">
        <div className="max-w-5xl mx-auto">
          <HeroCarousel />
        </div>
      </section>

      {/* ── Security Banner ───────────────────────────────────────────── */}
      <section
        className="px-4 py-5"
        style={{
          background: "rgba(0,26,26,0.9)",
          borderTop: "1.5px solid rgba(0,255,255,0.3)",
          borderBottom: "1.5px solid rgba(0,255,255,0.3)",
        }}
        data-ocid="security-banner"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,255,255,0.12)",
              border: "1.5px solid rgba(0,255,255,0.35)",
            }}
          >
            <Shield className="w-5 h-5" style={{ color: "#00FFFF" }} />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h2
              className="font-display font-bold text-base md:text-lg"
              style={{ color: "#00FFFF" }}
            >
              🛡️ Seguridad y Confianza
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed">
              En Tijuana Shop AE, el tiempo de todos vale. Al registrarte
              aceptas pagar una{" "}
              <span className="font-semibold" style={{ color: "#00FFFF" }}>
                multa de $50 MXN
              </span>{" "}
              en caso de no asistir a una cita confirmada con un vendedor.
            </p>
            <p
              className="text-xs font-medium"
              style={{ color: "rgba(0,255,255,0.65)" }}
            >
              ⚠️ Nunca compartas información bancaria por chat.
            </p>
          </div>
        </div>
      </section>

      {/* ── Zone Categories ───────────────────────────────────────────── */}
      <section
        className="px-4 py-10 md:py-14"
        style={{ background: "rgba(0,255,255,0.02)" }}
        data-ocid="zone-categories-section"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-6">
            Explorar por Zona
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ZONES.map((z) => {
              const active = zona === z.zone;
              return (
                <button
                  key={z.zone}
                  type="button"
                  onClick={() => handleZoneCard(z.zone)}
                  className="group flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-smooth border-cyan-subtle glow-cyan-hover"
                  style={{
                    background: active
                      ? "rgba(0,255,255,0.1)"
                      : "rgba(255,255,255,0.02)",
                    border: active
                      ? "1px solid rgba(0,255,255,0.45)"
                      : undefined,
                    boxShadow: active
                      ? "0 0 20px rgba(0,255,255,0.2)"
                      : undefined,
                  }}
                  data-ocid={`zone-card-${z.zone}`}
                  aria-pressed={active}
                >
                  <span className="text-3xl">{z.emoji}</span>
                  <span
                    className="font-display font-semibold text-sm md:text-base"
                    style={{ color: active ? "#00FFFF" : undefined }}
                  >
                    {z.label}
                  </span>
                  <span className="text-xs text-muted-foreground leading-snug">
                    {z.desc}
                  </span>
                  {active && (
                    <Badge
                      variant="outline"
                      className="text-[10px] mt-1"
                      style={{
                        borderColor: "rgba(0,255,255,0.4)",
                        color: "#00FFFF",
                      }}
                    >
                      Activo
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Products Grid ─────────────────────────────────────────────── */}
      <section
        className="px-4 py-10 md:py-14 bg-background"
        data-ocid="products-section"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">
              Productos Recientes
              {!isLoading && allProducts.length > 0 && (
                <span className="ml-2 text-muted-foreground text-base font-normal">
                  ({allProducts.length})
                </span>
              )}
            </h2>
            {(q || categoria || estado || zona || precioMin || precioMax) && (
              <button
                type="button"
                onClick={() => {
                  setSearchDraft("");
                  navigate({ to: "/", search: {} });
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                data-ocid="clear-filters-btn"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }, (_, i) => `sk-${i}`).map((id) => (
                <SkeletonCard key={id} />
              ))}
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
              data-ocid="products-empty-state"
            >
              <span className="text-5xl">🔍</span>
              <p className="font-display font-semibold text-lg text-foreground">
                No se encontraron productos
              </p>
              <p className="text-muted-foreground text-sm text-center max-w-xs">
                Intenta con otros filtros o busca otro término.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchDraft("");
                  navigate({ to: "/", search: {} });
                }}
                data-ocid="empty-clear-filters-btn"
              >
                Ver todos los productos
              </Button>
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-center gap-4 mt-10"
                  data-ocid="pagination"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="gap-1"
                    data-ocid="pagination-prev"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página{" "}
                    <strong className="text-foreground">{safePage}</strong> de{" "}
                    <strong className="text-foreground">{totalPages}</strong>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="gap-1"
                    data-ocid="pagination-next"
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Help / Community Section ──────────────────────────────────────── */}
      <section
        className="px-4 py-12 md:py-16"
        style={{
          background: "rgba(0,255,255,0.02)",
          borderTop: "1px solid rgba(0,255,255,0.08)",
        }}
        data-ocid="help-section"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-6 text-center">
            🤝 Comunidad y Confianza
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: "help-1",
                icon: "🛍️",
                text: "El mejor lugar para comprar y vender artículos en Tijuana.",
                border: "rgba(0,255,255,0.25)",
                bg: "rgba(0,255,255,0.04)",
                highlight: false,
              },
              {
                id: "help-2",
                icon: "🤝",
                text: "En Tijuana la confianza es primero; nadie entra sin decir quién es.",
                border: "rgba(0,255,200,0.2)",
                bg: "rgba(0,255,200,0.03)",
                highlight: false,
              },
              {
                id: "help-3",
                icon: "⭐",
                text: "¡Ya llegó el mercado exclusivo para Tijuana! Sin estafas de fuera, solo tratos entre vecinos. Regístrate hoy y obtén tu insignia de Fundador ⭐ y una semana de anuncios destacados gratis.",
                border: "rgba(0,255,255,0.35)",
                bg: "rgba(0,255,255,0.06)",
                highlight: true,
              },
            ].map((card) => (
              <div
                key={card.id}
                className="flex flex-col gap-3 p-5 rounded-2xl"
                style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                }}
                data-ocid={`help-card-${card.id}`}
              >
                <span className="text-3xl">{card.icon}</span>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: card.highlight
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.7)",
                    fontWeight: card.highlight ? 500 : 400,
                  }}
                >
                  {card.text}
                </p>
                {card.highlight && (
                  <span
                    className="self-start text-xs px-2.5 py-1 rounded-full font-semibold mt-1"
                    style={{
                      background: "rgba(0,255,255,0.1)",
                      border: "1px solid rgba(0,255,255,0.3)",
                      color: "#00FFFF",
                    }}
                  >
                    Solo para Tijuana
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admin Access Modal ────────────────────────────────────────── */}
      <Dialog open={adminModalOpen} onOpenChange={handleAdminModalClose}>
        <DialogContent
          className="max-w-sm"
          style={{
            background: "#0d1a1a",
            border: "1px solid rgba(0,255,255,0.3)",
            boxShadow: "0 0 40px rgba(0,255,255,0.15)",
          }}
          data-ocid="admin-access-modal"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Lock className="w-4 h-4" style={{ color: "#00FFFF" }} />
              Acceso restringido
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-1">
            Introduce la contraseña para continuar.
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <Input
              type="password"
              placeholder="Contraseña"
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setAdminError("");
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && handleAdminPasswordSubmit()
              }
              className="bg-card border-border focus:ring-2 text-foreground"
              style={
                adminError
                  ? { borderColor: "rgba(255,60,60,0.6)" }
                  : { borderColor: "rgba(0,255,255,0.25)" }
              }
              autoFocus
              data-ocid="admin-password-input"
            />
            {adminError && (
              <p
                className="text-xs font-medium"
                style={{ color: "#ff5050" }}
                data-ocid="admin-password-error"
              >
                {adminError}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminModalClose}
                data-ocid="admin-modal-cancel-btn"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAdminPasswordSubmit}
                style={{ background: "#00FFFF", color: "#0a0a0a" }}
                className="font-semibold hover:opacity-90 transition-smooth"
                data-ocid="admin-modal-confirm-btn"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
