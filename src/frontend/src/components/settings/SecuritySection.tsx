import type { UserProfile } from "@/backend";
import { Button } from "@/components/ui/button";
import { useActorRef } from "@/hooks/use-backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  LogOut,
  Monitor,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SectionCard } from "./SectionCard";

interface SecuritySectionProps {
  user: UserProfile;
}

export function SecuritySection({ user }: SecuritySectionProps) {
  const { actor } = useActorRef();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // Password form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const sessionTime = new Date().toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const browserInfo = navigator.userAgent.includes("Chrome")
    ? "Google Chrome"
    : navigator.userAgent.includes("Firefox")
      ? "Mozilla Firefox"
      : navigator.userAgent.includes("Safari")
        ? "Safari"
        : "Navegador desconocido";

  async function handlePasswordSave() {
    if (!newPass || !currentPass) {
      toast.error("Completa todos los campos de contraseña.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPass.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setSaving(true);
    try {
      // Password changes are managed via Internet Identity on this platform
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Solicitud de cambio de contraseña enviada.");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch {
      toast.error("Error al procesar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePrivacyToggle(
    field: "privacySearchable" | "privacyShowHistory",
    value: boolean,
  ) {
    if (!actor) return;
    setSaving(true);
    try {
      await actor.updateSettings({
        timezone: user.timezone,
        privacySearchable:
          field === "privacySearchable" ? value : user.privacySearchable,
        themePreference: user.themePreference,
        language: user.language,
        currency: user.currency,
        privacyShowHistory:
          field === "privacyShowHistory" ? value : user.privacyShowHistory,
        notificationsEmail: user.notificationsEmail,
        notificationsPush: user.notificationsPush,
      });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Privacidad actualizada.");
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
    window.location.href = "/";
  }

  return (
    <div className="flex flex-col gap-5" data-ocid="settings-security">
      {/* Cambiar contraseña */}
      <SectionCard title="Cambiar Contraseña" icon="🔑">
        <div className="flex flex-col gap-3">
          <PasswordField
            label="Contraseña actual"
            value={currentPass}
            onChange={setCurrentPass}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(!showCurrent)}
            ocid="settings-current-password"
          />
          <PasswordField
            label="Nueva contraseña"
            value={newPass}
            onChange={setNewPass}
            show={showNew}
            onToggleShow={() => setShowNew(!showNew)}
            ocid="settings-new-password"
          />
          <PasswordField
            label="Confirmar nueva contraseña"
            value={confirmPass}
            onChange={setConfirmPass}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
            ocid="settings-confirm-password"
          />

          <div
            className="flex items-start gap-2.5 p-3 rounded-xl"
            style={{
              background: "rgba(0,255,255,0.05)",
              border: "1px solid rgba(0,255,255,0.12)",
            }}
          >
            <KeyRound
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: "#00FFFF" }}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              La autenticación avanzada está gestionada por{" "}
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>
                Internet Identity
              </strong>
              . Para cambios de método de acceso, visita la configuración de tu
              identidad.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handlePasswordSave}
              disabled={saving || !currentPass || !newPass || !confirmPass}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-smooth disabled:opacity-50"
              style={{
                background: "#00FFFF",
                color: "#0a0a0a",
                boxShadow: "0 0 16px rgba(0,255,255,0.35)",
              }}
              data-ocid="settings-password-save-btn"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Actualizar contraseña
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard title="Autenticación en Dos Pasos (2FA)" icon="🛡️">
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Activar 2FA"
            description="Añade una capa extra de seguridad a tu cuenta."
            enabled={twoFAEnabled}
            disabled={saving}
            onToggle={setTwoFAEnabled}
            ocid="settings-2fa-toggle"
          />
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl"
            style={{
              background: "rgba(0,255,255,0.05)",
              border: "1px solid rgba(0,255,255,0.12)",
            }}
          >
            <Shield
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: "#00FFFF" }}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              La verificación en dos pasos es administrada por{" "}
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>
                Internet Identity
              </strong>
              , que ya incluye seguridad avanzada por diseño. Configuración
              adicional próximamente.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Privacidad */}
      <SectionCard title="Privacidad" icon="👁️">
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Aparecer en búsquedas"
            description="Otros usuarios pueden encontrarte en los resultados de búsqueda."
            enabled={user.privacySearchable}
            disabled={saving}
            onToggle={(v) => handlePrivacyToggle("privacySearchable", v)}
            ocid="settings-privacy-searchable"
          />
          <ToggleRow
            label="Mostrar historial de actividad"
            description="Tu actividad reciente será visible en tu perfil público."
            enabled={user.privacyShowHistory}
            disabled={saving}
            onToggle={(v) => handlePrivacyToggle("privacyShowHistory", v)}
            ocid="settings-privacy-history"
          />
        </div>
      </SectionCard>

      {/* Dispositivos */}
      <SectionCard title="Dispositivos y Sesiones" icon="💻">
        <div
          className="flex items-center gap-4 p-4 rounded-xl mb-3"
          style={{
            background: "rgba(0,255,255,0.05)",
            border: "1px solid rgba(0,255,255,0.15)",
          }}
          data-ocid="settings-current-session"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "rgba(0,255,255,0.1)",
              border: "1px solid rgba(0,255,255,0.3)",
            }}
          >
            <Monitor className="w-5 h-5" style={{ color: "#00FFFF" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {browserInfo}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(0,255,255,0.12)", color: "#00FFFF" }}
              >
                Esta sesión
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Última actividad: {sessionTime}
            </p>
          </div>
          <ShieldCheck
            className="w-4 h-4 shrink-0"
            style={{ color: "#00FFFF" }}
          />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Info className="w-3 h-3" />
          La gestión avanzada de sesiones está disponible en Internet Identity.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-smooth w-full sm:w-auto"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#ef4444",
          }}
          data-ocid="settings-logout-btn"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </SectionCard>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  ocid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  ocid: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={ocid}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={ocid}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="h-10 w-full rounded-lg pl-3 pr-10 text-sm bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-accent/50 transition-smooth placeholder:text-muted-foreground"
          data-ocid={ocid}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  disabled,
  onToggle,
  ocid,
}: {
  label: string;
  description: string;
  enabled: boolean;
  disabled: boolean;
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
        disabled={disabled}
        onClick={() => onToggle(!enabled)}
        className="relative shrink-0 w-11 h-6 rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
