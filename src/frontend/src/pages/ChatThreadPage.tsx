import type { Message } from "@/backend";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useActorRef,
  useChatMessages,
  useCurrentUser,
  useMyConversations,
  useSendMessage,
  useVendorProfile,
} from "@/hooks/use-backend";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Edit2,
  Image,
  Info,
  Lock,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Pin,
  Search,
  Send,
  Share2,
  Shield,
  Slash,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "../lib/dateUtils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatSettings {
  bubbleColor: BubbleColor;
  quickReaction: string;
  myNickname: string;
  otherNickname: string;
  confetti: boolean;
  hearts: boolean;
  emojiRain: boolean;
  autoSavePhotos: boolean;
  notifications: boolean;
  readReceipts: boolean;
  typingIndicator: boolean;
  messagePermission: "all" | "onlyMe";
  temporaryMessages: boolean;
  tempDuration: TempDuration;
}

type BubbleColor = "cyan" | "purple" | "orange" | "pink" | "green" | "gray";
type TempDuration = "1d" | "7d" | "30d";

const BUBBLE_COLORS: { id: BubbleColor; label: string; hex: string }[] = [
  { id: "cyan", label: "Cian", hex: "#00FFFF" },
  { id: "purple", label: "Morado", hex: "#a855f7" },
  { id: "orange", label: "Naranja", hex: "#f97316" },
  { id: "pink", label: "Rosa", hex: "#ec4899" },
  { id: "green", label: "Verde", hex: "#22c55e" },
  { id: "gray", label: "Gris", hex: "#6b7280" },
];

const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "😡"];
const TEMP_DURATIONS: { id: TempDuration; label: string }[] = [
  { id: "1d", label: "1 día" },
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
];

const DEFAULT_SETTINGS: ChatSettings = {
  bubbleColor: "cyan",
  quickReaction: "❤️",
  myNickname: "",
  otherNickname: "",
  confetti: false,
  hearts: false,
  emojiRain: false,
  autoSavePhotos: false,
  notifications: true,
  readReceipts: true,
  typingIndicator: true,
  messagePermission: "all",
  temporaryMessages: false,
  tempDuration: "7d",
};

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  subtitle,
  checked,
  badge,
  onChange,
  "data-ocid": ocid,
}: {
  label: string;
  subtitle?: string;
  checked: boolean;
  badge?: string;
  onChange: (v: boolean) => void;
  "data-ocid"?: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-3"
      data-ocid={ocid}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{label}</span>
          {badge && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: "#00FFFF", color: "#000" }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none"
        style={{
          background: checked ? "#00FFFF" : "rgba(255,255,255,0.15)",
          boxShadow: checked ? "0 0 8px rgba(0,255,255,0.4)" : undefined,
        }}
      >
        <span
          className="pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform duration-200"
          style={{
            background: "#fff",
            transform: checked ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </button>
    </div>
  );
}

// ─── Action Row ──────────────────────────────────────────────────────────────
function ActionRow({
  icon,
  label,
  subtitle,
  destructive,
  chevron,
  onClick,
  "data-ocid": ocid,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  destructive?: boolean;
  chevron?: boolean;
  onClick: () => void;
  "data-ocid"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 text-left transition-smooth hover:opacity-80"
      data-ocid={ocid}
    >
      <span
        className="shrink-0"
        style={{ color: destructive ? "#ff4d4f" : "rgba(255,255,255,0.6)" }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <span
          className="text-sm"
          style={{ color: destructive ? "#ff4d4f" : "inherit" }}
        >
          {label}
        </span>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {chevron && (
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <p
      className="text-xs font-bold tracking-widest uppercase mb-1 mt-5 first:mt-0"
      style={{ color: "#00FFFF" }}
    >
      {title}
    </p>
  );
}

// ─── Section Divider ──────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
  );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      data-ocid="confirm-dialog"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          background: "rgba(15,15,35,0.98)",
          border: "1px solid rgba(0,255,255,0.15)",
        }}
      >
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            data-ocid="confirm-cancel"
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={onConfirm}
            style={{
              background: destructive ? "#ff4d4f" : "#00FFFF",
              color: "#000",
            }}
            data-ocid="confirm-ok"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Report Form Dialog ───────────────────────────────────────────────────────
const REPORT_REASONS = [
  "Spam o publicidad",
  "Contenido inapropiado",
  "Acoso o amenazas",
  "Información falsa",
  "Intento de estafa",
  "Otro motivo",
];

function ReportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState("");
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      data-ocid="report-dialog"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          background: "rgba(15,15,35,0.98)",
          border: "1px solid rgba(255,77,79,0.25)",
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Reportar conversación
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelected(r)}
              className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm text-left transition-smooth"
              style={{
                background:
                  selected === r
                    ? "rgba(255,77,79,0.1)"
                    : "rgba(255,255,255,0.03)",
                border:
                  selected === r
                    ? "1px solid rgba(255,77,79,0.4)"
                    : "1px solid rgba(255,255,255,0.07)",
                color: selected === r ? "#ff4d4f" : undefined,
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <Button
          className="w-full"
          disabled={!selected}
          style={{ background: "#ff4d4f", color: "#fff" }}
          onClick={() => {
            onClose();
          }}
          data-ocid="report-submit"
        >
          Enviar reporte
        </Button>
      </div>
    </div>
  );
}

// ─── Share Contact Dialog ─────────────────────────────────────────────────────
function ShareContactDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      data-ocid="share-contact-dialog"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          background: "rgba(15,15,35,0.98)",
          border: "1px solid rgba(0,255,255,0.15)",
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Compartir contacto
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="share-contact-name"
              className="text-xs text-muted-foreground"
            >
              Nombre
            </label>
            <input
              id="share-contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del contacto"
              className="w-full px-3 py-2 rounded-lg text-sm bg-transparent text-foreground outline-none"
              style={{ border: "1px solid rgba(0,255,255,0.2)" }}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="share-contact-phone"
              className="text-xs text-muted-foreground"
            >
              Teléfono
            </label>
            <input
              id="share-contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 664 123 4567"
              className="w-full px-3 py-2 rounded-lg text-sm bg-transparent text-foreground outline-none"
              style={{ border: "1px solid rgba(0,255,255,0.2)" }}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={!name.trim() || !phone.trim()}
            style={{ background: "#00FFFF", color: "#000" }}
            onClick={onClose}
            data-ocid="share-contact-send"
          >
            Compartir
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Encryption Info Dialog ───────────────────────────────────────────────────
function EncryptionDialog({
  open,
  otherName,
  onClose,
}: {
  open: boolean;
  otherName: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      data-ocid="encryption-dialog"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          background: "rgba(15,15,35,0.98)",
          border: "1px solid rgba(0,255,255,0.15)",
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,255,255,0.1)" }}
          >
            <Lock className="w-6 h-6" style={{ color: "#00FFFF" }} />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Cifrado de extremo a extremo
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta conversación está protegida con cifrado de extremo a extremo.
            Solo tú y{" "}
            <span className="text-foreground font-medium">{otherName}</span>{" "}
            pueden leer estos mensajes.
          </p>
        </div>
        <Button
          className="w-full"
          style={{ background: "#00FFFF", color: "#000" }}
          onClick={onClose}
          data-ocid="encryption-ok"
        >
          Entendido
        </Button>
      </div>
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
interface SettingsPanelProps {
  open: boolean;
  otherName: string;
  settings: ChatSettings;
  onChange: <K extends keyof ChatSettings>(
    key: K,
    val: ChatSettings[K],
  ) => void;
  onClose: () => void;
}

function SettingsPanel({
  open,
  otherName,
  settings,
  onChange,
  onClose,
}: SettingsPanelProps) {
  const [editingNickname, setEditingNickname] = useState<"me" | "other" | null>(
    null,
  );
  const [nicknameInput, setNicknameInput] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "restrict" | "block" | "deleteChat";
  } | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [showShareContact, setShowShareContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const bubbleHex =
    BUBBLE_COLORS.find((c) => c.id === settings.bubbleColor)?.hex ?? "#00FFFF";

  function saveNickname() {
    if (editingNickname === "me") onChange("myNickname", nicknameInput);
    else if (editingNickname === "other")
      onChange("otherNickname", nicknameInput);
    setEditingNickname(null);
    setNicknameInput("");
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Cerrar panel"
        />
      )}

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden transition-all duration-300"
        style={{
          width: "min(100vw, 380px)",
          background: "rgba(8,8,25,0.98)",
          borderLeft: "1px solid rgba(0,255,255,0.12)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          boxShadow: open ? "-8px 0 40px rgba(0,0,0,0.6)" : "none",
        }}
        data-ocid="chat-settings-panel"
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="text-base font-semibold text-foreground">
            Detalles de la conversación
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-smooth hover:bg-card"
            aria-label="Cerrar"
            data-ocid="settings-close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {/* ── PERSONALIZACIÓN ── */}
          <SectionHeader title="Personalización" />

          {/* Bubble color */}
          <div className="py-3 space-y-3" data-ocid="bubble-color-picker">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Estilo</span>
              <div
                className="w-5 h-5 rounded-full border-2"
                style={{ background: bubbleHex, borderColor: bubbleHex }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {BUBBLE_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChange("bubbleColor", c.id)}
                  className="w-8 h-8 rounded-full transition-smooth"
                  style={{
                    background: c.hex,
                    boxShadow:
                      settings.bubbleColor === c.id
                        ? `0 0 0 2px rgba(255,255,255,0.9), 0 0 10px ${c.hex}`
                        : "none",
                  }}
                  aria-label={c.label}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <Divider />

          {/* Quick reaction */}
          <div className="py-3 space-y-2" data-ocid="quick-reaction">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Reacción rápida</span>
              <span className="text-lg">{settings.quickReaction}</span>
            </div>
            <div className="flex gap-2">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onChange("quickReaction", emoji)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-smooth"
                  style={{
                    background:
                      settings.quickReaction === emoji
                        ? "rgba(0,255,255,0.15)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      settings.quickReaction === emoji
                        ? "1px solid rgba(0,255,255,0.4)"
                        : "1px solid transparent",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Divider />

          {/* Nicknames */}
          <div className="py-3 space-y-2" data-ocid="nicknames">
            <span className="text-sm text-foreground">Apodos</span>
            {[
              { key: "me" as const, label: "Tú", value: settings.myNickname },
              {
                key: "other" as const,
                label: otherName || "El otro usuario",
                value: settings.otherNickname,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 py-1"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{item.label}</p>
                  {item.value && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.value}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingNickname(item.key);
                    setNicknameInput(item.value);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-smooth hover:bg-card"
                  aria-label={`Editar apodo de ${item.label}`}
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}

            {/* Nickname edit input */}
            {editingNickname && (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={nicknameInput}
                  maxLength={30}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="Escribe un apodo…"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm bg-transparent text-foreground outline-none"
                  style={{ border: "1px solid rgba(0,255,255,0.3)" }}
                  // biome-ignore lint/a11y/noAutofocus: intentional UX
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveNickname()}
                  data-ocid="nickname-input"
                />
                <button
                  type="button"
                  onClick={saveNickname}
                  className="px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: "#00FFFF", color: "#000" }}
                  data-ocid="nickname-save"
                >
                  Guardar
                </button>
              </div>
            )}
          </div>

          <Divider />

          {/* Text effects */}
          <div className="py-1" data-ocid="text-effects">
            <p className="text-sm text-foreground mb-1">Efectos de texto</p>
            <ToggleRow
              label="Confeti"
              checked={settings.confetti}
              onChange={(v) => onChange("confetti", v)}
              data-ocid="toggle-confetti"
            />
            <ToggleRow
              label="Corazones"
              checked={settings.hearts}
              onChange={(v) => onChange("hearts", v)}
              data-ocid="toggle-hearts"
            />
            <ToggleRow
              label="Lluvia de emojis"
              checked={settings.emojiRain}
              onChange={(v) => onChange("emojiRain", v)}
              data-ocid="toggle-emoji-rain"
            />
          </div>

          {/* ── MÁS ACCIONES ── */}
          <SectionHeader title="Más acciones" />

          <ActionRow
            icon={<MessageSquarePlus className="w-4 h-4" />}
            label="Crear chat en grupo"
            chevron
            onClick={() => {}}
            data-ocid="action-group-chat"
          />
          <Divider />
          <ActionRow
            icon={<Image className="w-4 h-4" />}
            label="Ver contenido multimedia, archivos y enlaces"
            chevron
            onClick={() => {}}
            data-ocid="action-media-grid"
          />
          <Divider />
          <ToggleRow
            label="Guardar fotos automáticamente"
            checked={settings.autoSavePhotos}
            onChange={(v) => onChange("autoSavePhotos", v)}
            data-ocid="toggle-auto-save"
          />
          <Divider />
          <ActionRow
            icon={<Pin className="w-4 h-4" />}
            label="Mensajes fijados"
            subtitle="No hay mensajes fijados"
            chevron
            onClick={() => {}}
            data-ocid="action-pinned"
          />
          <Divider />

          {/* Search in conversation */}
          <ActionRow
            icon={<Search className="w-4 h-4" />}
            label="Buscar en la conversación"
            chevron
            onClick={() => setShowSearch((v) => !v)}
            data-ocid="action-search"
          />
          {showSearch && (
            <div className="pb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar mensajes…"
                className="w-full px-3 py-2 rounded-lg text-sm bg-transparent text-foreground outline-none"
                style={{ border: "1px solid rgba(0,255,255,0.25)" }}
                data-ocid="search-input"
              />
            </div>
          )}
          <Divider />
          <ToggleRow
            label="Notificaciones y sonidos"
            subtitle="Activar notificaciones para esta conversación"
            checked={settings.notifications}
            onChange={(v) => onChange("notifications", v)}
            data-ocid="toggle-notifications"
          />
          <Divider />
          <ActionRow
            icon={<Share2 className="w-4 h-4" />}
            label="Compartir contacto"
            chevron
            onClick={() => setShowShareContact(true)}
            data-ocid="action-share-contact"
          />

          {/* ── PRIVACIDAD Y AYUDA ── */}
          <SectionHeader title="Privacidad y ayuda" />

          {/* Message permission */}
          <div className="py-3" data-ocid="message-permission">
            <p className="text-sm text-foreground mb-2">Permisos de mensajes</p>
            <div className="flex gap-2">
              {[
                { id: "all" as const, label: "Todos" },
                { id: "onlyMe" as const, label: "Solo yo puedo iniciar" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange("messagePermission", opt.id)}
                  className="flex-1 py-2 px-3 rounded-lg text-xs transition-smooth"
                  style={{
                    border:
                      settings.messagePermission === opt.id
                        ? "1px solid #00FFFF"
                        : "1px solid rgba(255,255,255,0.1)",
                    background:
                      settings.messagePermission === opt.id
                        ? "rgba(0,255,255,0.1)"
                        : "transparent",
                    color:
                      settings.messagePermission === opt.id
                        ? "#00FFFF"
                        : "rgba(255,255,255,0.6)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Divider />

          <ActionRow
            icon={<Shield className="w-4 h-4" />}
            label="Verificar cifrado de extremo a extremo"
            chevron
            onClick={() => setShowEncryption(true)}
            data-ocid="action-encryption"
          />
          <Divider />

          {/* Temporary messages */}
          <div className="py-1" data-ocid="temporary-messages">
            <ToggleRow
              label="Mensajes temporales"
              subtitle={
                settings.temporaryMessages
                  ? `Se eliminan en: ${TEMP_DURATIONS.find((d) => d.id === settings.tempDuration)?.label}`
                  : "Desactivado"
              }
              checked={settings.temporaryMessages}
              badge="Nuevo"
              onChange={(v) => onChange("temporaryMessages", v)}
            />
            {settings.temporaryMessages && (
              <div className="flex gap-2 pb-2">
                {TEMP_DURATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onChange("tempDuration", d.id)}
                    className="flex-1 py-1.5 rounded-lg text-xs transition-smooth"
                    style={{
                      border:
                        settings.tempDuration === d.id
                          ? "1px solid #00FFFF"
                          : "1px solid rgba(255,255,255,0.1)",
                      background:
                        settings.tempDuration === d.id
                          ? "rgba(0,255,255,0.1)"
                          : "transparent",
                      color:
                        settings.tempDuration === d.id
                          ? "#00FFFF"
                          : "rgba(255,255,255,0.5)",
                    }}
                    data-ocid={`temp-duration-${d.id}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Divider />

          <ToggleRow
            label="Confirmaciones de lectura"
            checked={settings.readReceipts}
            onChange={(v) => onChange("readReceipts", v)}
            data-ocid="toggle-read-receipts"
          />
          <Divider />
          <ToggleRow
            label="Indicador de escritura"
            subtitle="Mostrar cuando estoy escribiendo"
            checked={settings.typingIndicator}
            onChange={(v) => onChange("typingIndicator", v)}
            data-ocid="toggle-typing"
          />
          <Divider />

          <ActionRow
            icon={<UserMinus className="w-4 h-4" />}
            label="Restringir"
            subtitle="Los mensajes irán a solicitudes"
            onClick={() => setConfirmDialog({ type: "restrict" })}
            data-ocid="action-restrict"
          />
          <Divider />
          <ActionRow
            icon={<Slash className="w-4 h-4" />}
            label="Bloquear"
            destructive
            onClick={() => setConfirmDialog({ type: "block" })}
            data-ocid="action-block"
          />
          <Divider />
          <ActionRow
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Reportar"
            subtitle="Reportar esta conversación"
            destructive
            onClick={() => setShowReport(true)}
            data-ocid="action-report"
          />
          <Divider />
          <ActionRow
            icon={<Trash2 className="w-4 h-4" />}
            label="Eliminar chat"
            destructive
            onClick={() => setConfirmDialog({ type: "deleteChat" })}
            data-ocid="action-delete-chat"
          />
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmDialog?.type === "restrict"}
        title="Restringir usuario"
        message="¿Restringir a este usuario? Los mensajes irán a solicitudes."
        confirmLabel="Restringir"
        onConfirm={() => setConfirmDialog(null)}
        onCancel={() => setConfirmDialog(null)}
      />
      <ConfirmDialog
        open={confirmDialog?.type === "block"}
        title={`Bloquear a ${otherName || "este usuario"}`}
        message={`¿Bloquear a ${otherName || "este usuario"}? Ya no podrán enviarte mensajes.`}
        confirmLabel="Bloquear"
        destructive
        onConfirm={() => setConfirmDialog(null)}
        onCancel={() => setConfirmDialog(null)}
      />
      <ConfirmDialog
        open={confirmDialog?.type === "deleteChat"}
        title="Eliminar chat"
        message="¿Eliminar este chat? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => setConfirmDialog(null)}
        onCancel={() => setConfirmDialog(null)}
      />
      <ReportDialog open={showReport} onClose={() => setShowReport(false)} />
      <EncryptionDialog
        open={showEncryption}
        otherName={otherName}
        onClose={() => setShowEncryption(false)}
      />
      <ShareContactDialog
        open={showShareContact}
        onClose={() => setShowShareContact(false)}
      />
    </>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({
  msg,
  isMine,
  bubbleColor,
}: {
  msg: Message;
  isMine: boolean;
  bubbleColor: BubbleColor;
}) {
  const hex = BUBBLE_COLORS.find((c) => c.id === bubbleColor)?.hex ?? "#00FFFF";

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
      data-ocid={isMine ? "message-mine" : "message-theirs"}
    >
      <div
        className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
        style={
          isMine
            ? {
                background: hex,
                color: "#000",
                borderBottomRightRadius: "4px",
              }
            : {
                background: "rgba(42,42,62,1)",
                color: "#fff",
                border: "1px solid rgba(0,255,255,0.12)",
                borderBottomLeftRadius: "4px",
              }
        }
      >
        <p className="break-words">{msg.text}</p>
        <p
          className={`text-[10px] mt-1 text-right ${isMine ? "text-black/50" : "text-muted-foreground"}`}
        >
          {formatDistanceToNow(Number(msg.timestamp) / 1_000_000)}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChatThreadPage() {
  const { conversationId } = useParams({ from: "/chat/$conversationId" });
  const navigate = useNavigate();
  const { user, isAuthenticated } = useCurrentUser();
  const [text, setText] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { actor } = useActorRef();

  const { data: conversations = [] } = useMyConversations();
  const conv = conversations.find((c) => c.id === conversationId);

  const otherUserId = conv
    ? user?.id === conv.buyerId
      ? conv.sellerId
      : conv.buyerId
    : undefined;
  const { data: otherUser } = useVendorProfile(otherUserId ?? "");

  const { data: messages = [], isLoading } = useChatMessages(
    conversationId,
    true,
  );
  const sendMessage = useSendMessage();

  // Mark as read on mount
  useEffect(() => {
    if (actor && conversationId) {
      actor.markConversationAsRead(conversationId).catch(() => null);
    }
  }, [actor, conversationId]);

  // Scroll to bottom whenever messages render
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(scrollToBottom, [messages]);

  if (!isAuthenticated) {
    void navigate({ to: "/login" });
    return null;
  }

  function updateSetting<K extends keyof ChatSettings>(
    key: K,
    val: ChatSettings[K],
  ) {
    setSettings((prev) => ({ ...prev, [key]: val }));
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;
    setText("");
    sendMessage.mutate(
      { conversationId, text: trimmed },
      {
        onError: () => setText(trimmed),
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherName = otherUser?.name ?? "";
  const otherInitials = otherName
    ? otherName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const sortedMessages = [...messages].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp),
  );

  return (
    <>
      <div
        className="flex flex-col h-[calc(100dvh-64px)] max-w-2xl mx-auto w-full"
        data-ocid="chat-thread-page"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{
            background: "rgba(10,10,30,0.95)",
            borderBottom: "1px solid rgba(0,255,255,0.12)",
          }}
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/chat" })}
            aria-label="Volver"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-smooth hover:bg-card"
            data-ocid="chat-back-btn"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "#00FFFF" }} />
          </button>

          <Avatar className="w-9 h-9 shrink-0">
            {otherUser?.avatarUrl && (
              <img src={otherUser.avatarUrl} alt={otherUser.name} />
            )}
            <AvatarFallback
              className="text-xs font-semibold"
              style={{ background: "rgba(0,255,255,0.12)", color: "#00FFFF" }}
            >
              {otherInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {otherName || "Cargando…"}
            </p>
            {conv && (
              <p className="text-xs text-muted-foreground truncate">
                Producto #{conv.productId.slice(0, 8)}
              </p>
            )}
          </div>

          {/* Info button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Información de la conversación"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-smooth hover:bg-card"
            data-ocid="chat-info-btn"
          >
            <Info className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {isLoading ? (
            <div className="space-y-3 pt-4">
              {(["a", "b", "c"] as const).map((k) => (
                <Skeleton key={k} className="h-10 rounded-2xl w-2/3" />
              ))}
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <p className="text-sm text-center">
                Aún no hay mensajes. ¡Inicia la conversación!
              </p>
            </div>
          ) : (
            sortedMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={msg.authorId === user?.id}
                bubbleColor={settings.bubbleColor}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="shrink-0 flex items-center gap-2 px-4 py-3"
          style={{
            background: "rgba(10,10,30,0.97)",
            borderTop: "1px solid rgba(0,255,255,0.1)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tu mensaje…"
            maxLength={1000}
            className="flex-1 min-w-0 bg-card rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-smooth"
            style={{ border: "1px solid rgba(0,255,255,0.2)" }}
            data-ocid="chat-input"
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
            className="w-11 h-11 rounded-xl p-0 shrink-0"
            style={{
              background: text.trim()
                ? "rgba(0,255,255,0.15)"
                : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(0,255,255,0.3)",
              color: "#00FFFF",
            }}
            aria-label="Enviar"
            data-ocid="chat-send-btn"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings slide-in panel */}
      <SettingsPanel
        open={settingsOpen}
        otherName={otherName}
        settings={settings}
        onChange={updateSetting}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
