import type { UserProfile } from "@/backend";
import { useActorRef } from "@/hooks/use-backend";
import { useQueryClient } from "@tanstack/react-query";
import { BellOff, Check, Globe, Info, Moon, Sun, SunMoon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SectionCard } from "./SectionCard";

type ThemeMode = "light" | "dark" | "auto";

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

const TIMEZONES = [
  { value: "America/Tijuana", label: "Tijuana (PST/PDT)" },
  { value: "America/Mexico_City", label: "Ciudad de México (CST/CDT)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (PST/PDT)" },
  { value: "America/New_York", label: "Nueva York (EST/EDT)" },
  { value: "UTC", label: "UTC" },
];

const CURRENCIES = [
  { value: "MXN", label: "MXN — Peso Mexicano" },
  { value: "USD", label: "USD — Dólar Americano" },
  { value: "EUR", label: "EUR — Euro" },
];

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else if (theme === "light") root.classList.remove("dark");
  else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }
  localStorage.setItem("tijuana-theme", theme);
}

interface PreferencesSectionProps {
  user: UserProfile;
}

export function PreferencesSection({ user }: PreferencesSectionProps) {
  const { actor } = useActorRef();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const currentTheme =
    (localStorage.getItem("tijuana-theme") as ThemeMode) ||
    (user.themePreference as ThemeMode) ||
    "dark";
  const [theme, setTheme] = useState<ThemeMode>(currentTheme);
  const [language, setLanguage] = useState(user.language || "es");
  const [timezone, setTimezone] = useState(user.timezone || "America/Tijuana");
  const [currency, setCurrency] = useState(user.currency || "MXN");
  const [notifEmail, _setNotifEmail] = useState(user.notificationsEmail);
  const [notifPush, setNotifPush] = useState(user.notificationsPush);

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    applyTheme(theme);
    try {
      await actor.updateSettings({
        timezone,
        privacySearchable: user.privacySearchable,
        themePreference: theme,
        language,
        currency,
        privacyShowHistory: user.privacyShowHistory,
        notificationsEmail: notifEmail,
        notificationsPush: notifPush,
      });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Preferencias guardadas correctamente.");
    } catch {
      toast.error("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5" data-ocid="settings-preferences">
      {/* Apariencia */}
      <SectionCard title="Apariencia" icon="🌙">
        <p className="text-sm text-muted-foreground mb-3">
          Selecciona cómo quieres ver la aplicación.
        </p>
        <div
          className="grid grid-cols-3 gap-3"
          data-ocid="settings-theme-selector"
        >
          {[
            {
              value: "light" as ThemeMode,
              icon: <Sun className="w-5 h-5" />,
              label: "Claro",
            },
            {
              value: "dark" as ThemeMode,
              icon: <Moon className="w-5 h-5" />,
              label: "Oscuro",
            },
            {
              value: "auto" as ThemeMode,
              icon: <SunMoon className="w-5 h-5" />,
              label: "Automático",
            },
          ].map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-smooth"
                style={
                  active
                    ? {
                        background: "rgba(0,255,255,0.12)",
                        border: "2px solid rgba(0,255,255,0.5)",
                      }
                    : {
                        background: "rgba(255,255,255,0.03)",
                        border: "2px solid rgba(255,255,255,0.08)",
                      }
                }
                data-ocid={`settings-theme-${opt.value}`}
              >
                <span
                  style={{
                    color: active ? "#00FFFF" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {opt.icon}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: active ? "#00FFFF" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Idioma y Región */}
      <SectionCard title="Idioma y Región" icon="🌎">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Idioma"
            icon={<Globe className="w-4 h-4" />}
            value={language}
            onChange={setLanguage}
            options={LANGUAGES}
            ocid="settings-language-select"
          />
          <SelectField
            label="Zona horaria"
            icon={<Globe className="w-4 h-4" />}
            value={timezone}
            onChange={setTimezone}
            options={TIMEZONES}
            ocid="settings-timezone-select"
          />
          <SelectField
            label="Moneda"
            icon={<Globe className="w-4 h-4" />}
            value={currency}
            onChange={setCurrency}
            options={CURRENCIES}
            ocid="settings-currency-select"
          />
        </div>
      </SectionCard>

      {/* Notificaciones */}
      <SectionCard title="Notificaciones" icon="🔔">
        <div className="flex flex-col gap-3">
          {/* Email — disabled */}
          <div
            className="flex items-center justify-between gap-4 p-3.5 rounded-xl opacity-50"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                Correo electrónico
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <BellOff className="w-3 h-3" /> No disponible — requiere
                activación de plataforma
              </span>
            </div>
            <div
              className="relative w-11 h-6 rounded-full cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.1)" }}
              data-ocid="settings-notif-email"
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full"
                style={{ background: "rgba(255,255,255,0.4)" }}
              />
            </div>
          </div>

          {/* Push */}
          <NotifToggle
            label="Notificaciones push"
            description="Alertas en el navegador sobre nuevos mensajes y actividad."
            enabled={notifPush}
            onToggle={setNotifPush}
            ocid="settings-notif-push"
          />

          {/* SMS — disabled */}
          <div
            className="flex items-center justify-between gap-4 p-3.5 rounded-xl opacity-50"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">SMS</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <BellOff className="w-3 h-3" /> No disponible — requiere
                activación de plataforma
              </span>
            </div>
            <div
              className="relative w-11 h-6 rounded-full cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.1)" }}
              data-ocid="settings-notif-sms"
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full"
                style={{ background: "rgba(255,255,255,0.4)" }}
              />
            </div>
          </div>

          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{
              background: "rgba(0,255,255,0.05)",
              border: "1px solid rgba(0,255,255,0.12)",
            }}
          >
            <Info
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: "#00FFFF" }}
            />
            <p className="text-xs text-muted-foreground">
              Las notificaciones por correo y SMS estarán disponibles cuando se
              active la plataforma de mensajería.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "#00FFFF",
            color: "#0a0a0a",
            boxShadow: "0 0 16px rgba(0,255,255,0.4)",
          }}
          data-ocid="settings-preferences-save"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
  ocid,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ocid: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={ocid}
        className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
      >
        <span style={{ color: "rgba(0,255,255,0.7)" }}>{icon}</span>
        {label}
      </label>
      <select
        id={ocid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg px-3 text-sm bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-accent/50 transition-smooth"
        data-ocid={ocid}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NotifToggle({
  label,
  description,
  enabled,
  onToggle,
  ocid,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  ocid: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-3.5 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className="relative shrink-0 w-11 h-6 rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-2"
        style={{
          background: enabled
            ? "rgba(0,255,255,0.8)"
            : "rgba(255,255,255,0.12)",
          boxShadow: enabled ? "0 0 10px rgba(0,255,255,0.4)" : "none",
        }}
        data-ocid={ocid}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-smooth"
          style={{
            background: enabled ? "#0a0a0a" : "rgba(255,255,255,0.7)",
            transform: enabled ? "translateX(20px)" : "translateX(0px)",
          }}
        />
      </button>
    </div>
  );
}
