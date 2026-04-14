import { cn } from "@/lib/utils";
import type { SettingsTab } from "@/pages/SettingsPage";

const TABS: {
  id: SettingsTab;
  icon: string;
  label: string;
  description: string;
}[] = [
  {
    id: "identidad",
    icon: "👤",
    label: "Identidad",
    description: "Perfil y cuenta",
  },
  {
    id: "seguridad",
    icon: "🔒",
    label: "Seguridad y Privacidad",
    description: "Contraseña, 2FA, privacidad",
  },
  {
    id: "personalizacion",
    icon: "🎨",
    label: "Personalización",
    description: "Tema, idioma, notificaciones",
  },
  {
    id: "actividad",
    icon: "📋",
    label: "Actividad y Utilidades",
    description: "Historial, pagos, soporte",
  },
  {
    id: "comunidad",
    icon: "🤝",
    label: "Comunidad",
    description: "Valores y confianza",
  },
];

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <nav
      className="flex flex-col gap-1 p-2 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(0,255,255,0.1)",
      }}
      data-ocid="settings-sidebar"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-smooth w-full group",
              isActive ? "" : "hover:bg-white/5",
            )}
            style={
              isActive
                ? {
                    background: "rgba(0,255,255,0.1)",
                    border: "1px solid rgba(0,255,255,0.25)",
                  }
                : { border: "1px solid transparent" }
            }
            data-ocid={`settings-sidebar-${tab.id}`}
          >
            <span className="text-base leading-none mt-0.5">{tab.icon}</span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-sm font-semibold leading-none"
                style={{
                  color: isActive ? "#00FFFF" : "rgba(255,255,255,0.85)",
                }}
              >
                {tab.label}
              </span>
              <span className="text-xs text-muted-foreground leading-snug">
                {tab.description}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
