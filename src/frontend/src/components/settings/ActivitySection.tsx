import type { ActivityEvent } from "@/backend";
import { OfficialLogo } from "@/components/OfficialLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyActivity } from "@/hooks/use-backend";
import { Link } from "@tanstack/react-router";
import {
  ExternalLink,
  HelpCircle,
  Mail,
  Package,
  ShoppingCart,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { SectionCard } from "./SectionCard";

const PAGE_SIZE = 20;

function getEventIcon(eventType: string) {
  if (eventType.includes("product") || eventType.includes("publish"))
    return <Package className="w-4 h-4" />;
  if (eventType.includes("purchase") || eventType.includes("buy"))
    return <ShoppingCart className="w-4 h-4" />;
  if (eventType.includes("rating") || eventType.includes("review"))
    return <Star className="w-4 h-4" />;
  return <User className="w-4 h-4" />;
}

function formatTimestamp(ts: bigint): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "Todos los tipos" },
  { value: "product", label: "Productos" },
  { value: "purchase", label: "Compras" },
  { value: "rating", label: "Calificaciones" },
  { value: "profile", label: "Perfil" },
  { value: "register", label: "Registro" },
];

// ── Acerca de Tijuana Shop AE ─────────────────────────────────────────────────

function AboutSection() {
  return (
    <div className="flex flex-col gap-3" data-ocid="settings-about">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <OfficialLogo size={36} className="shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Acerca de Tijuana Shop AE
          </p>
          <p className="text-xs text-muted-foreground">
            Tu marketplace local en línea
          </p>
        </div>
      </div>

      {/* Card 1 — Tagline */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: "rgba(0,255,255,0.05)",
          border: "1px solid rgba(0,255,255,0.3)",
        }}
        data-ocid="settings-about-tagline"
      >
        <p className="text-sm font-bold text-foreground leading-snug">
          El mejor lugar para comprar y vender artículos en Tijuana.
        </p>
      </div>

      {/* Card 2 — Community trust quote */}
      <div
        className="p-4 rounded-xl flex gap-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderLeft: "3px solid rgba(0,255,255,0.6)",
        }}
        data-ocid="settings-about-community"
      >
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          "En Tijuana la confianza es primero; nadie entra sin decir quién es."
        </p>
      </div>

      {/* Card 3 — Founder promo */}
      <div
        className="p-4 rounded-xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,30,30,0.9) 0%, rgba(0,15,20,0.95) 100%)",
          border: "1px solid rgba(0,255,255,0.35)",
          boxShadow:
            "0 0 20px rgba(0,255,255,0.08), inset 0 0 30px rgba(0,0,0,0.3)",
        }}
        data-ocid="settings-about-founder"
      >
        {/* Glow accent */}
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="flex items-start gap-3 relative z-10">
          <span className="text-2xl mt-0.5 shrink-0">⭐</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-1" style={{ color: "#00FFFF" }}>
              ¡Oferta de Fundador!
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ¡Ya llegó el mercado exclusivo para Tijuana! Sin estafas de fuera,
              solo tratos entre vecinos. Regístrate hoy y obtén tu insignia de
              Fundador ⭐ y una semana de anuncios destacados gratis.
            </p>
          </div>
        </div>
        {/* Bottom badge */}
        <div className="mt-3 flex justify-end relative z-10">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{
              background: "rgba(0,255,255,0.12)",
              border: "1px solid rgba(0,255,255,0.3)",
              color: "#00FFFF",
            }}
          >
            Solo para Tijuana
          </span>
        </div>
      </div>
    </div>
  );
}

export function ActivitySection() {
  const { data: activity = [], isLoading } = useMyActivity();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered: ActivityEvent[] = filter
    ? activity.filter((ev) =>
        ev.eventType.toLowerCase().includes(filter.toLowerCase()),
      )
    : activity;

  const paged = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paged.length < filtered.length;

  return (
    <div className="flex flex-col gap-5" data-ocid="settings-activity">
      {/* Activity Log */}
      <SectionCard title="Historial de Actividad" icon="📋">
        <div className="flex items-center gap-3 mb-4">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg px-3 text-sm bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-accent/50 transition-smooth"
            data-ocid="settings-activity-filter"
          >
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            {filtered.length} evento{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, i) => `sk-${i}`).map((id) => (
              <Skeleton key={id} className="h-14 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-10 gap-2 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            data-ocid="settings-activity-empty"
          >
            <span className="text-3xl">📭</span>
            <p className="text-sm font-semibold text-foreground">
              Sin actividad aún
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-[220px]">
              Tu historial de actividad aparecerá aquí una vez que empieces a
              usar la plataforma.
            </p>
          </div>
        )}

        {!isLoading && paged.length > 0 && (
          <div className="flex flex-col gap-2">
            {paged.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3.5 rounded-xl transition-smooth hover:bg-white/5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                data-ocid={`settings-activity-item-${event.id}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(0,255,255,0.08)",
                    border: "1px solid rgba(0,255,255,0.2)",
                  }}
                >
                  <span style={{ color: "rgba(0,255,255,0.8)" }}>
                    {getEventIcon(event.eventType)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {event.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium transition-smooth"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
            data-ocid="settings-activity-load-more"
          >
            Cargar más
          </button>
        )}
      </SectionCard>

      {/* Wallet / Payments */}
      <SectionCard title="Billetera y Pagos" icon="💳">
        <div
          className="flex flex-col items-center gap-3 py-8 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.12)",
          }}
          data-ocid="settings-wallet-placeholder"
        >
          <Wallet
            className="w-10 h-10"
            style={{ color: "rgba(0,255,255,0.4)" }}
          />
          <div className="text-center">
            <p className="font-semibold text-foreground">
              Pagos y Suscripciones
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              La integración con Stripe estará disponible próximamente. Podrás
              gestionar métodos de pago, facturas y suscripciones activas.
            </p>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{
              background: "rgba(0,255,255,0.1)",
              color: "#00FFFF",
              border: "1px solid rgba(0,255,255,0.3)",
            }}
          >
            Próximamente
          </span>
        </div>
      </SectionCard>

      {/* Help / Support */}
      <SectionCard title="Ayuda y Soporte" icon="🆘">
        <div className="flex flex-col gap-4" data-ocid="settings-help">
          {/* About section — above help links */}
          <AboutSection />

          {/* Divider */}
          <div
            className="h-px w-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />

          {/* Help links */}
          <div className="flex flex-col gap-2">
            <HelpItem
              icon={<ExternalLink className="w-4 h-4" />}
              href="/terminos"
              label="Términos y Condiciones"
              isRouterLink
            />
            <HelpItem
              icon={<ExternalLink className="w-4 h-4" />}
              href="/privacidad"
              label="Política de Privacidad"
              isRouterLink
            />
            <HelpItem
              icon={<Mail className="w-4 h-4" />}
              href="mailto:soporte@tijuanashopae.com"
              label="Contactar Soporte: soporte@tijuanashopae.com"
              ocid="settings-help-email"
            />
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ color: "rgba(0,255,255,0.6)" }}>
                <HelpCircle className="w-4 h-4" />
              </span>
              <span className="text-sm text-muted-foreground">
                Centro de Ayuda (próximamente)
              </span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function HelpItem({
  icon,
  href,
  label,
  isRouterLink,
  ocid,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
  isRouterLink?: boolean;
  ocid?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-smooth hover:bg-white/5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ color: "rgba(0,255,255,0.6)" }}>{icon}</span>
      {isRouterLink ? (
        <Link
          to={href as "/terminos" | "/privacidad"}
          className="text-sm text-foreground hover:text-accent transition-colors"
        >
          {label}
        </Link>
      ) : (
        <a
          href={href}
          className="text-sm text-foreground hover:text-accent transition-colors"
          data-ocid={ocid}
        >
          {label}
        </a>
      )}
    </div>
  );
}
