import { ActivitySection } from "@/components/settings/ActivitySection";
import { IdentitySection } from "@/components/settings/IdentitySection";
import { PreferencesSection } from "@/components/settings/PreferencesSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export type SettingsTab =
  | "identidad"
  | "seguridad"
  | "personalizacion"
  | "actividad"
  | "comunidad";

const TABS: { id: SettingsTab; icon: string; label: string }[] = [
  { id: "identidad", icon: "👤", label: "Identidad" },
  { id: "seguridad", icon: "🔒", label: "Seguridad" },
  { id: "personalizacion", icon: "🎨", label: "Preferencias" },
  { id: "actividad", icon: "📋", label: "Actividad" },
  { id: "comunidad", icon: "🤝", label: "Comunidad" },
];

// ─── Community Help Cards ─────────────────────────────────────────────────────
const HELP_CARDS = [
  {
    id: "trust",
    icon: "🤝",
    title: "La confianza es primero",
    text: "En Tijuana la confianza es primero; nadie entra sin decir quién es.",
    border: "rgba(0,255,200,0.3)",
    bg: "rgba(0,255,200,0.04)",
    accent: "#00FFC8",
  },
  {
    id: "founder",
    icon: "⭐",
    title: "Mercado exclusivo para Tijuana",
    text: "¡Ya llegó el mercado exclusivo para Tijuana! Sin estafas de fuera, solo tratos entre vecinos. Regístrate hoy y obtén tu insignia de Fundador ⭐ y una semana de anuncios destacados gratis.",
    border: "rgba(0,255,255,0.4)",
    bg: "rgba(0,255,255,0.06)",
    accent: "#00FFFF",
    highlight: true,
  },
  {
    id: "best",
    icon: "🛍️",
    title: "El mejor marketplace local",
    text: "El mejor lugar para comprar y vender artículos en Tijuana.",
    border: "rgba(0,255,255,0.2)",
    bg: "rgba(0,255,255,0.03)",
    accent: "#00FFFF",
  },
];

function CommunitySection() {
  return (
    <div className="flex flex-col gap-6" data-ocid="community-section">
      <div>
        <h2
          className="font-display font-bold text-xl text-foreground mb-1"
          style={{ letterSpacing: "-0.02em" }}
        >
          🤝 Comunidad y Confianza
        </h2>
        <p className="text-sm text-muted-foreground">
          Valores que hacen de Tijuana Shop AE un lugar seguro para todos.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {HELP_CARDS.map((card) => (
          <div
            key={card.id}
            className="flex flex-col gap-3 p-5 rounded-2xl"
            style={{
              background: card.bg,
              border: `1.5px solid ${card.border}`,
            }}
            data-ocid={`community-card-${card.id}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{card.icon}</span>
              <h3
                className="font-display font-semibold text-base"
                style={{ color: card.accent }}
              >
                {card.title}
              </h3>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: card.highlight
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.72)",
                fontWeight: card.highlight ? 500 : 400,
              }}
            >
              {card.text}
            </p>
            {card.highlight && (
              <span
                className="self-start text-xs px-2.5 py-1 rounded-full font-semibold"
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

      {/* Safety reminder */}
      <div
        className="p-4 rounded-xl text-sm text-muted-foreground"
        style={{
          background: "rgba(255,165,0,0.05)",
          border: "1px solid rgba(255,165,0,0.2)",
        }}
      >
        ⚠️{" "}
        <strong style={{ color: "rgba(255,200,0,0.85)" }}>
          Nunca compartas información bancaria
        </strong>{" "}
        por el chat de la plataforma. Los tratos seguros son en persona o
        mediante el sistema de pago integrado.
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const { isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("identidad");

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isInitializing && !isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [isInitializing, isLoading, user, navigate]);

  if (isInitializing || isLoading || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="flex gap-8">
          <Skeleton className="w-56 h-80 rounded-2xl hidden md:block" />
          <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-10 pb-24"
      data-ocid="settings-page"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/perfil" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-lg hover:bg-muted/20"
          aria-label="Volver al perfil"
          data-ocid="settings-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Perfil</span>
        </button>
        <h1
          className="font-display font-bold text-2xl text-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span style={{ color: "#00FFFF" }}>⚙</span> Configuración
        </h1>
      </div>

      {/* Mobile: tab strip */}
      <div
        className="md:hidden flex gap-1 mb-6 overflow-x-auto pb-1 rounded-xl p-1"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(0,255,255,0.1)",
        }}
        data-ocid="settings-mobile-tabs"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-smooth"
            style={
              activeTab === tab.id
                ? { background: "rgba(0,255,255,0.15)", color: "#00FFFF" }
                : { color: "rgba(255,255,255,0.55)" }
            }
            data-ocid={`settings-tab-${tab.id}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop: sidebar + content */}
      <div className="flex gap-8 items-start">
        <div className="hidden md:block w-56 shrink-0">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <main className="flex-1 min-w-0">
          {activeTab === "identidad" && <IdentitySection user={user} />}
          {activeTab === "seguridad" && <SecuritySection user={user} />}
          {activeTab === "personalizacion" && (
            <PreferencesSection user={user} />
          )}
          {activeTab === "actividad" && <ActivitySection />}
          {activeTab === "comunidad" && <CommunitySection />}
        </main>
      </div>
    </div>
  );
}
