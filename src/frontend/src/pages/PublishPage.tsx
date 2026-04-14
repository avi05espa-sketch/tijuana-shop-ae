import type { Product } from "@/backend";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useActorRef,
  useCurrentUser,
  useStorageClient,
} from "@/hooks/use-backend";
import {
  ProductCategory,
  ProductCondition,
  ProductZone,
  formatCategory,
  formatZone,
} from "@/types/marketplace";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Film,
  ImagePlus,
  Info,
  Loader2,
  Lock,
  MessageCircle,
  RefreshCw,
  Star,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────
interface FormData {
  title: string;
  category: ProductCategory | "";
  condition: ProductCondition | "";
  description: string;
  price: string;
  negotiable: boolean;
  zone: ProductZone | "";
  colony: string;
  whatsappContact: string;
  isApartado: boolean;
}

type UploadStatus = "pending" | "uploading" | "done" | "error";

interface MediaEntry {
  id: string;
  file: File;
  preview: string;
  isVideo: boolean;
  status: UploadStatus;
  progress: number;
  hash?: string;
  errorMsg?: string;
  caption: string;
}

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8" data-ocid="publish-step-indicator">
      <div className="flex items-center justify-between relative">
        <div
          className="absolute left-0 top-4 h-0.5 transition-all duration-500"
          style={{
            width: `${((current - 1) / (total - 1)) * 100}%`,
            background: "#00FFFF",
            zIndex: 0,
          }}
        />
        <div
          className="absolute left-0 top-4 h-0.5 w-full"
          style={{ background: "rgba(255,255,255,0.1)", zIndex: -1 }}
        />
        {labels.map((label, i) => {
          const step = i + 1;
          const isDone = step < current;
          const isActive = step === current;
          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: isActive
                    ? "#00FFFF"
                    : isDone
                      ? "rgba(0,255,255,0.2)"
                      : "rgba(255,255,255,0.08)",
                  color: isActive
                    ? "#000"
                    : isDone
                      ? "#00FFFF"
                      : "rgba(255,255,255,0.4)",
                  border: isDone
                    ? "2px solid rgba(0,255,255,0.5)"
                    : isActive
                      ? "none"
                      : "2px solid rgba(255,255,255,0.12)",
                  boxShadow: isActive
                    ? "0 0 14px rgba(0,255,255,0.6)"
                    : undefined,
                }}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{
                  color: isActive ? "#00FFFF" : "rgba(255,255,255,0.4)",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Field helpers ─────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p
      className="flex items-center gap-1 text-xs mt-1"
      style={{ color: "#ff4d4f" }}
    >
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );
}

// ─── Media Thumbnail ─────────────────────────────────────────────────────────
interface ThumbnailProps {
  entry: MediaEntry;
  index: number;
  total: number;
  isCover: boolean;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onSetCover: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
}

function MediaThumbnail({
  entry,
  index,
  total,
  isCover,
  onRemove,
  onRetry,
  onSetCover,
  onMoveUp,
  onMoveDown,
  onCaptionChange,
}: ThumbnailProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Thumbnail */}
      <div
        className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
        style={{
          border: isCover
            ? "2px solid #00FFFF"
            : entry.status === "error"
              ? "2px solid #ff4d4f"
              : entry.status === "done"
                ? "2px solid rgba(0,255,255,0.3)"
                : "2px solid rgba(255,255,255,0.08)",
          boxShadow: isCover ? "0 0 12px rgba(0,255,255,0.4)" : undefined,
        }}
        onClick={() => !entry.isVideo && onSetCover(entry.id)}
        onKeyDown={(e) => {
          if (!entry.isVideo && (e.key === "Enter" || e.key === " "))
            onSetCover(entry.id);
        }}
        role={entry.isVideo ? undefined : "button"}
        tabIndex={entry.isVideo ? undefined : 0}
        data-ocid={`thumbnail-${index}`}
      >
        {/* Preview */}
        {entry.isVideo ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Film className="w-8 h-8 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={entry.preview}
            alt={`Foto ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Upload overlay */}
        {entry.status === "uploading" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1"
            style={{ background: "rgba(0,0,0,0.65)" }}
          >
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: "#00FFFF" }}
            />
            <span className="text-[10px]" style={{ color: "#00FFFF" }}>
              {Math.round(entry.progress)}%
            </span>
            <div className="w-3/4">
              <Progress value={entry.progress} className="h-1" />
            </div>
          </div>
        )}

        {/* Error overlay */}
        {entry.status === "error" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1"
            style={{ background: "rgba(0,0,0,0.75)" }}
          >
            <AlertCircle className="w-4 h-4" style={{ color: "#ff4d4f" }} />
            <span
              className="text-[9px] text-center leading-tight"
              style={{ color: "#ff4d4f" }}
            >
              {entry.errorMsg ?? "Error"}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetry(entry.id);
              }}
              className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded mt-0.5"
              style={{ background: "rgba(0,255,255,0.15)", color: "#00FFFF" }}
              aria-label="Reintentar subida"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Reintentar
            </button>
          </div>
        )}

        {/* Done check */}
        {entry.status === "done" && !isCover && (
          <div
            className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,255,255,0.2)" }}
          >
            <CheckCircle2 className="w-3 h-3" style={{ color: "#00FFFF" }} />
          </div>
        )}

        {/* Cover star */}
        {isCover && (
          <div
            className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#00FFFF" }}
          >
            <Star className="w-3 h-3 fill-black text-black" />
          </div>
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(entry.id);
          }}
          className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth"
          style={{ background: "rgba(0,0,0,0.75)", color: "#fff" }}
          aria-label="Eliminar archivo"
          data-ocid={`remove-media-${index}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Principal badge */}
        {isCover && !entry.isVideo && (
          <span
            className="absolute bottom-1 left-1 text-[9px] px-1 py-0.5 rounded font-semibold"
            style={{
              background: "#00FFFF",
              color: "#000",
            }}
          >
            Principal
          </span>
        )}

        {/* Video badge */}
        {entry.isVideo && (
          <span
            className="absolute bottom-1 right-1 text-[9px] px-1 py-0.5 rounded"
            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
          >
            VIDEO
          </span>
        )}
      </div>

      {/* Reorder arrows */}
      <div className="flex gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMoveUp(entry.id)}
          className="flex-1 flex items-center justify-center h-6 rounded text-[10px] transition-smooth disabled:opacity-30"
          style={{
            background: "rgba(0,255,255,0.08)",
            color: "#00FFFF",
            border: "1px solid rgba(0,255,255,0.15)",
          }}
          aria-label="Mover arriba"
          data-ocid={`move-up-${index}`}
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMoveDown(entry.id)}
          className="flex-1 flex items-center justify-center h-6 rounded text-[10px] transition-smooth disabled:opacity-30"
          style={{
            background: "rgba(0,255,255,0.08)",
            color: "#00FFFF",
            border: "1px solid rgba(0,255,255,0.15)",
          }}
          aria-label="Mover abajo"
          data-ocid={`move-down-${index}`}
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>

      {/* Caption input */}
      {!entry.isVideo && (
        <input
          type="text"
          value={entry.caption}
          maxLength={60}
          onChange={(e) => onCaptionChange(entry.id, e.target.value)}
          placeholder="Descripción (opcional)"
          className="w-full text-[11px] px-2 py-1.5 rounded bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          data-ocid={`caption-${index}`}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}

// ─── Photo Guidelines Card ─────────────────────────────────────────────────
function PhotoGuidelinesCard() {
  return (
    <div
      className="flex gap-3 rounded-xl p-3"
      style={{
        background: "rgba(0,255,255,0.04)",
        border: "1px solid rgba(0,255,255,0.15)",
      }}
    >
      <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#00FFFF" }} />
      <div className="space-y-1 text-xs text-muted-foreground">
        <p className="font-medium" style={{ color: "#00FFFF" }}>
          Consejos para tus fotos
        </p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>Fotos claras y bien iluminadas generan más confianza.</li>
          <li>Incluye fotos desde diferentes ángulos.</li>
          <li>
            Muestra detalles importantes como etiquetas, número de serie o
            defectos.
          </li>
          <li>La primera foto será la imagen principal del anuncio.</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PublishPage() {
  const { isVendor, isLoading } = useCurrentUser();
  const { actor } = useActorRef();
  const storageClient = useStorageClient();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [media, setMedia] = useState<MediaEntry[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | "photos" | "confirm", string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const [form, setForm] = useState<FormData>({
    title: "",
    category: "",
    condition: "",
    description: "",
    price: "",
    negotiable: false,
    zone: "",
    colony: "",
    whatsappContact: "",
    isApartado: false,
  });

  const STEP_LABELS = ["Información", "Precio", "Fotos", "Revisión"];
  const TOTAL_STEPS = 4;
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const ACCEPTED_VIDEO_TYPES = ["video/mp4"];
  const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
  const MAX_PHOTOS = 10;
  const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

  const photoEntries = media.filter((m) => !m.isVideo);
  const videoEntry = media.find((m) => m.isVideo);
  const coverEntry = coverId
    ? media.find((m) => m.id === coverId)
    : photoEntries[0];
  const effectiveCoverId = coverEntry?.id ?? null;

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // ─── Reorder helpers ──────────────────────────────────────────────────────
  function moveMedia(entryId: string, direction: "up" | "down") {
    setMedia((prev) => {
      const idx = prev.findIndex((m) => m.id === entryId);
      if (idx === -1) return prev;
      const newArr = [...prev];
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= newArr.length) return prev;
      [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]];
      return newArr;
    });
  }

  function updateCaption(entryId: string, caption: string) {
    setMedia((prev) =>
      prev.map((m) => (m.id === entryId ? { ...m, caption } : m)),
    );
  }

  // ─── Validations ────────────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "El título es obligatorio.";
    else if (form.title.length > 100) e.title = "Máximo 100 caracteres.";
    if (!form.category) e.category = "Selecciona una categoría.";
    if (!form.condition) e.condition = "Selecciona el estado del producto.";
    if (!form.description.trim())
      e.description = "La descripción es obligatoria.";
    else if (form.description.length > 2000)
      e.description = "Máximo 2,000 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: typeof errors = {};
    const priceNum = Number.parseFloat(form.price.replace(/,/g, ""));
    if (!form.price.trim()) e.price = "El precio es obligatorio.";
    else if (Number.isNaN(priceNum) || priceNum <= 0)
      e.price = "Ingresa un precio válido mayor a $0.";
    if (!form.zone) e.zone = "Selecciona una zona.";
    if (!form.colony.trim()) e.colony = "Ingresa la colonia o área.";
    if (!form.whatsappContact.trim())
      e.whatsappContact = "El número de WhatsApp es obligatorio.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep4(): boolean {
    const e: typeof errors = {};
    if (!confirmInfo || !confirmTerms)
      e.confirm = "Debes confirmar ambas declaraciones antes de publicar.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  // ─── Upload a single entry ────────────────────────────────────────────────
  async function uploadEntry(entryId: string): Promise<void> {
    if (!storageClient) return;

    setMedia((prev) =>
      prev.map((m) =>
        m.id === entryId
          ? { ...m, status: "uploading", progress: 0, errorMsg: undefined }
          : m,
      ),
    );

    const entry = media.find((m) => m.id === entryId);
    if (!entry) return;

    try {
      const arrayBuf = await entry.file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);

      const { hash } = await storageClient.putFile(bytes, (pct: number) => {
        setMedia((prev) =>
          prev.map((m) => (m.id === entryId ? { ...m, progress: pct } : m)),
        );
      });

      setMedia((prev) =>
        prev.map((m) =>
          m.id === entryId ? { ...m, status: "done", progress: 100, hash } : m,
        ),
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al subir archivo.";
      setMedia((prev) =>
        prev.map((m) =>
          m.id === entryId
            ? { ...m, status: "error", progress: 0, errorMsg: msg }
            : m,
        ),
      );
      toast.error(`Error al subir archivo: ${msg}`);
    }
  }

  // ─── Handle file selection ────────────────────────────────────────────────
  async function handleFiles(files: FileList | null, videoOnly = false) {
    if (!files) return;
    const currentPhotos = media.filter((m) => !m.isVideo).length;
    const newEntries: MediaEntry[] = [];

    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(
          `Tipo no permitido: ${file.name}. Solo JPEG, PNG, WebP o MP4.`,
        );
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`Archivo muy pesado: ${file.name}. Máximo 20MB.`);
        continue;
      }
      const isVideo = file.type.startsWith("video/");

      if (videoOnly && !isVideo) continue;

      if (isVideo) {
        if (videoEntry) {
          toast.warning("Solo se permite 1 video por publicación.");
          continue;
        }
      } else {
        if (
          currentPhotos + newEntries.filter((e) => !e.isVideo).length >=
          MAX_PHOTOS
        ) {
          toast.warning(`Máximo ${MAX_PHOTOS} fotos permitidas.`);
          break;
        }
      }

      const id = `media-${Date.now()}-${nextId.current++}`;
      newEntries.push({
        id,
        file,
        preview: isVideo ? "" : URL.createObjectURL(file),
        isVideo,
        status: "pending",
        progress: 0,
        caption: "",
      });
    }

    if (newEntries.length === 0) return;

    setMedia((prev) => [...prev, ...newEntries]);
    setErrors((prev) => ({ ...prev, photos: undefined }));

    if (!storageClient) {
      toast.error(
        "Cliente de almacenamiento no disponible aún. Intenta de nuevo.",
      );
      return;
    }

    for (const entry of newEntries) {
      await uploadEntry(entry.id);
    }
  }

  // ─── Retry a failed upload ────────────────────────────────────────────────
  async function handleRetry(entryId: string) {
    if (!storageClient) {
      toast.error("Cliente de almacenamiento no disponible.");
      return;
    }
    await uploadEntry(entryId);
  }

  // ─── Remove a media entry ─────────────────────────────────────────────────
  function removeMedia(entryId: string) {
    setMedia((prev) => {
      const entry = prev.find((m) => m.id === entryId);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      return prev.filter((m) => m.id !== entryId);
    });
    if (coverId === entryId) setCoverId(null);
    toast.info("Foto eliminada");
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  async function handlePublish() {
    if (!validateStep4()) return;
    if (!actor) {
      toast.error("Actor no disponible. Recarga la página.");
      return;
    }

    const uploading = media.filter((m) => m.status === "uploading");
    if (uploading.length > 0) {
      toast.warning("Espera a que terminen de subir las fotos.");
      return;
    }

    const failed = media.filter((m) => m.status === "error");
    if (failed.length > 0) {
      toast.error(
        `${failed.length} archivo(s) no pudieron subirse. Reintenta o elimínalos antes de publicar.`,
      );
      return;
    }

    // Build ordered hashes: cover first, then the rest, then video
    const donePhotos = media.filter(
      (m) => !m.isVideo && m.status === "done" && m.hash,
    );
    // Put cover first
    const coverPhoto = donePhotos.find((m) => m.id === effectiveCoverId);
    const otherPhotos = donePhotos.filter((m) => m.id !== effectiveCoverId);
    const orderedPhotos = coverPhoto
      ? [coverPhoto, ...otherPhotos]
      : donePhotos;
    const photoHashes = orderedPhotos.map((m) => m.hash as string);

    setSubmitting(true);
    try {
      const priceNum = Number.parseFloat(form.price.replace(/,/g, ""));
      const product: Product = await actor.createProduct(
        form.title.trim(),
        form.description.trim(),
        priceNum,
        form.negotiable,
        form.category as ProductCategory,
        form.condition as ProductCondition,
        form.zone as ProductZone,
        form.colony.trim(),
        photoHashes,
        form.whatsappContact.trim() || null,
        form.isApartado,
      );

      toast.success("¡Producto publicado exitosamente!");
      navigate({ to: "/producto/$id", params: { id: product.id } });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al publicar. Intenta de nuevo.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Auth guard ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#00FFFF" }}
        />
      </div>
    );
  }

  if (!isVendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground text-center max-w-xs">
          Solo los vendedores registrados pueden publicar productos.
        </p>
      </div>
    );
  }

  const priceDisplay = form.price
    ? `$${Number.parseFloat(form.price.replace(/,/g, "") || "0").toLocaleString("es-MX", { maximumFractionDigits: 0 })} MXN`
    : "—";

  const uploadingCount = media.filter((m) => m.status === "uploading").length;
  const errorCount = media.filter((m) => m.status === "error").length;
  const doneCount = media.filter((m) => m.status === "done").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-ocid="publish-page">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        Publicar producto
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Tu anuncio estará visible para toda la comunidad de Tijuana
      </p>

      <StepIndicator current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

      <div
        className="rounded-2xl bg-card p-6 space-y-5"
        style={{ border: "1px solid rgba(0,255,255,0.12)" }}
      >
        {/* ── Step 1: Información básica ── */}
        {step === 1 && (
          <div className="space-y-5" data-ocid="step-info">
            <h2
              className="font-display text-lg font-semibold"
              style={{ color: "#00FFFF" }}
            >
              Información básica
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Título <span style={{ color: "#00FFFF" }}>*</span>
              </Label>
              <Input
                id="title"
                placeholder='ej. Bicicleta Montaña 26" — Buen estado'
                value={form.title}
                maxLength={100}
                onChange={(e) => set("title", e.target.value)}
                data-ocid="input-title"
              />
              <div className="flex justify-between items-center">
                <FieldError msg={errors.title} />
                <span className="text-xs text-muted-foreground ml-auto">
                  {form.title.length}/100
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>
                Categoría <span style={{ color: "#00FFFF" }}>*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as ProductCategory)}
              >
                <SelectTrigger data-ocid="select-category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {formatCategory(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError msg={errors.category} />
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <Label>
                Estado del producto <span style={{ color: "#00FFFF" }}>*</span>
              </Label>
              <div className="flex gap-3">
                {(
                  [
                    ProductCondition.nuevo,
                    ProductCondition.usado,
                  ] as ProductCondition[]
                ).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => set("condition", cond)}
                    className="flex-1 py-3 rounded-lg text-sm font-medium transition-smooth"
                    style={{
                      border:
                        form.condition === cond
                          ? "2px solid #00FFFF"
                          : "1px solid rgba(255,255,255,0.12)",
                      background:
                        form.condition === cond
                          ? "rgba(0,255,255,0.1)"
                          : "transparent",
                      color: form.condition === cond ? "#00FFFF" : undefined,
                      boxShadow:
                        form.condition === cond
                          ? "0 0 10px rgba(0,255,255,0.3)"
                          : undefined,
                    }}
                    data-ocid={`condition-${cond}`}
                  >
                    {cond === ProductCondition.nuevo ? "✨ Nuevo" : "🔄 Usado"}
                  </button>
                ))}
              </div>
              <FieldError msg={errors.condition} />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Descripción <span style={{ color: "#00FFFF" }}>*</span>
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Incluye: marca, modelo, año, condición, motivo de venta, accesorios incluidos..."
                value={form.description}
                maxLength={2000}
                onChange={(e) => set("description", e.target.value)}
                data-ocid="input-description"
              />
              <div className="flex justify-between items-center">
                <FieldError msg={errors.description} />
                <span className="text-xs text-muted-foreground ml-auto">
                  {form.description.length}/2000
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Precio y detalles ── */}
        {step === 2 && (
          <div className="space-y-5" data-ocid="step-price">
            <h2
              className="font-display text-lg font-semibold"
              style={{ color: "#00FFFF" }}
            >
              Precio y detalles
            </h2>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="price">
                Precio (MXN) <span style={{ color: "#00FFFF" }}>*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  id="price"
                  className="pl-7"
                  placeholder="1,500"
                  value={form.price}
                  type="number"
                  min={1}
                  onChange={(e) => set("price", e.target.value)}
                  data-ocid="input-price"
                />
              </div>
              {form.price && (
                <p className="text-xs" style={{ color: "#00FFFF" }}>
                  {priceDisplay}
                </p>
              )}
              <FieldError msg={errors.price} />
            </div>

            {/* Negotiable */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="negotiable"
                checked={form.negotiable}
                onCheckedChange={(v) => set("negotiable", Boolean(v))}
                data-ocid="checkbox-negotiable"
              />
              <Label htmlFor="negotiable" className="cursor-pointer">
                Precio negociable
              </Label>
            </div>

            {/* Zone */}
            <div className="space-y-1.5">
              <Label>
                Zona <span style={{ color: "#00FFFF" }}>*</span>
              </Label>
              <Select
                value={form.zone}
                onValueChange={(v) => set("zone", v as ProductZone)}
              >
                <SelectTrigger data-ocid="select-zone">
                  <SelectValue placeholder="Selecciona tu zona" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductZone).map((z) => (
                    <SelectItem key={z} value={z}>
                      {formatZone(z)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError msg={errors.zone} />
            </div>

            {/* Colony */}
            <div className="space-y-1.5">
              <Label htmlFor="colony">
                Colonia / Área <span style={{ color: "#00FFFF" }}>*</span>
              </Label>
              <Input
                id="colony"
                placeholder="ej. Zona Río, Hipódromo, Playas de Tijuana"
                value={form.colony}
                onChange={(e) => set("colony", e.target.value)}
                data-ocid="input-colony"
              />
              <FieldError msg={errors.colony} />
            </div>

            {/* WhatsApp Contact */}
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">
                WhatsApp del vendedor{" "}
                <span style={{ color: "#00FFFF" }}>*</span>
              </Label>
              <div className="relative">
                <MessageCircle
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#25D366" }}
                />
                <Input
                  id="whatsapp"
                  className="pl-9"
                  placeholder="+52 664 123 4567"
                  value={form.whatsappContact}
                  type="tel"
                  onChange={(e) => set("whatsappContact", e.target.value)}
                  data-ocid="input-whatsapp"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Los compradores podrán contactarte directamente por WhatsApp.
              </p>
              <FieldError msg={errors.whatsappContact} />
            </div>
          </div>
        )}

        {/* ── Step 3: Fotos y videos ── */}
        {step === 3 && (
          <div className="space-y-5" data-ocid="step-photos">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="font-display text-lg font-semibold"
                  style={{ color: "#00FFFF" }}
                >
                  Fotos del producto
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPEG, PNG o WebP · Máx. 20MB por foto
                </p>
              </div>
              <span
                className="text-sm font-semibold px-2 py-1 rounded-lg"
                style={{
                  background: "rgba(0,255,255,0.1)",
                  color: "#00FFFF",
                  border: "1px solid rgba(0,255,255,0.2)",
                }}
                data-ocid="photo-counter"
              >
                {photoEntries.length} / {MAX_PHOTOS} fotos
              </span>
            </div>

            {/* Guidelines */}
            <PhotoGuidelinesCard />

            {/* Upload summary bar */}
            {media.length > 0 && (
              <div
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs flex-wrap"
                style={{
                  background: "rgba(0,255,255,0.05)",
                  border: "1px solid rgba(0,255,255,0.1)",
                }}
              >
                {uploadingCount > 0 && (
                  <span
                    className="flex items-center gap-1"
                    style={{ color: "#00FFFF" }}
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Subiendo… {uploadingCount}
                  </span>
                )}
                {doneCount > 0 && (
                  <span
                    className="flex items-center gap-1"
                    style={{ color: "#00FFFF" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Listas: {doneCount}
                  </span>
                )}
                {errorCount > 0 && (
                  <span
                    className="flex items-center gap-1"
                    style={{ color: "#ff4d4f" }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    Errores: {errorCount}
                  </span>
                )}
                {effectiveCoverId && (
                  <span
                    className="flex items-center gap-1 ml-auto"
                    style={{ color: "#00FFFF" }}
                  >
                    <Star className="w-3 h-3 fill-[#00FFFF]" />
                    Foto principal seleccionada
                  </span>
                )}
              </div>
            )}

            {/* Photo drop zone */}
            {photoEntries.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl p-6 flex flex-col items-center gap-3 transition-smooth"
                style={{
                  border: "2px dashed rgba(0,255,255,0.25)",
                  background: "rgba(0,255,255,0.03)",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
                data-ocid="photo-upload-zone"
              >
                <ImagePlus className="w-7 h-7" style={{ color: "#00FFFF" }} />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Arrastra tus fotos aquí o{" "}
                    <span style={{ color: "#00FFFF" }}>
                      haz clic para seleccionar
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hasta {MAX_PHOTOS} fotos · JPEG, PNG, WebP
                  </p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />

            {/* Cover hint */}
            {photoEntries.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3" style={{ color: "#00FFFF" }} />
                Toca una foto para marcarla como principal (portada del anuncio)
              </p>
            )}

            {/* Thumbnails grid */}
            {photoEntries.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photoEntries.map((entry, i) => (
                  <MediaThumbnail
                    key={entry.id}
                    entry={entry}
                    index={i}
                    total={photoEntries.length}
                    isCover={entry.id === effectiveCoverId}
                    onRemove={removeMedia}
                    onRetry={handleRetry}
                    onSetCover={setCoverId}
                    onMoveUp={(id) => moveMedia(id, "up")}
                    onMoveDown={(id) => moveMedia(id, "down")}
                    onCaptionChange={updateCaption}
                  />
                ))}
              </div>
            )}

            {errors.photos && <FieldError msg={errors.photos} />}

            {/* Divider */}
            <div
              className="border-t pt-5"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              {/* Video section */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Film className="w-4 h-4" style={{ color: "#00FFFF" }} />
                    Video{" "}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Máx. 1 video de 30 segundos · Solo MP4 · Máx. 20MB
                  </p>
                </div>

                {videoEntry ? (
                  <div
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{
                      background: "rgba(0,255,255,0.05)",
                      border: "1px solid rgba(0,255,255,0.15)",
                    }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {videoEntry.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(videoEntry.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                      {videoEntry.status === "uploading" && (
                        <Progress
                          value={videoEntry.progress}
                          className="h-1 mt-1"
                        />
                      )}
                      {videoEntry.status === "done" && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#00FFFF" }}
                        >
                          ✓ Subido
                        </p>
                      )}
                      {videoEntry.status === "error" && (
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-xs"
                            style={{ color: "#ff4d4f" }}
                          >
                            Error
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRetry(videoEntry.id)}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: "rgba(0,255,255,0.15)",
                              color: "#00FFFF",
                            }}
                          >
                            Reintentar
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(videoEntry.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                      aria-label="Eliminar video"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full rounded-xl p-4 flex items-center gap-3 transition-smooth"
                    style={{
                      border: "2px dashed rgba(255,255,255,0.12)",
                      background: "transparent",
                    }}
                    data-ocid="video-upload-zone"
                  >
                    <Film className="w-5 h-5 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Agregar video{" "}
                      <span style={{ color: "#00FFFF" }}>· MP4</span>
                    </span>
                  </button>
                )}

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4"
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files, true);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Revisión y publicar ── */}
        {step === 4 && (
          <div className="space-y-5" data-ocid="step-review">
            <h2
              className="font-display text-lg font-semibold"
              style={{ color: "#00FFFF" }}
            >
              Revisión y publicar
            </h2>

            {/* Summary */}
            <div
              className="rounded-xl p-4 space-y-3 text-sm"
              style={{
                background: "rgba(0,255,255,0.04)",
                border: "1px solid rgba(0,255,255,0.12)",
              }}
            >
              {[
                { label: "Título", value: form.title || "—" },
                {
                  label: "Categoría",
                  value: form.category
                    ? formatCategory(form.category as ProductCategory)
                    : "—",
                },
                {
                  label: "Estado",
                  value:
                    form.condition === ProductCondition.nuevo
                      ? "Nuevo"
                      : form.condition === ProductCondition.usado
                        ? "Usado"
                        : "—",
                },
                {
                  label: "Precio",
                  value:
                    priceDisplay + (form.negotiable ? " (Negociable)" : ""),
                },
                {
                  label: "Zona",
                  value: form.zone ? formatZone(form.zone as ProductZone) : "—",
                },
                { label: "Colonia", value: form.colony || "—" },
                {
                  label: "WhatsApp",
                  value: form.whatsappContact || "—",
                },
                {
                  label: "Fotos",
                  value:
                    photoEntries.length > 0
                      ? `${doneCount} subida(s)${errorCount > 0 ? ` · ${errorCount} con error` : ""}${uploadingCount > 0 ? ` · ${uploadingCount} subiendo` : ""}`
                      : "Sin fotos",
                },
                {
                  label: "Video",
                  value: videoEntry
                    ? videoEntry.status === "done"
                      ? "1 video subido"
                      : "1 video (pendiente)"
                    : "Sin video",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">
                    {label}
                  </span>
                  <span className="text-foreground text-right truncate">
                    {value}
                  </span>
                </div>
              ))}

              {form.description && (
                <div
                  className="pt-2"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-muted-foreground mb-1">Descripción</p>
                  <p className="text-foreground text-xs line-clamp-3">
                    {form.description}
                  </p>
                </div>
              )}
            </div>

            {/* Cover photo preview */}
            {photoEntries.length > 0 && coverEntry && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3" style={{ color: "#00FFFF" }} />
                  Foto principal
                </p>
                <div
                  className="w-24 h-24 rounded-lg overflow-hidden"
                  style={{ border: "2px solid #00FFFF" }}
                >
                  <img
                    src={coverEntry.preview}
                    alt="Foto principal"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Apartado toggle */}
            <div
              className="flex items-center justify-between gap-3 p-4 rounded-xl"
              style={{
                background: form.isApartado
                  ? "rgba(255,165,0,0.08)"
                  : "rgba(255,255,255,0.03)",
                border: form.isApartado
                  ? "1px solid rgba(255,165,0,0.35)"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
              data-ocid="toggle-apartado-row"
            >
              <div className="flex items-center gap-3">
                <Lock
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: form.isApartado
                      ? "#FFA500"
                      : "rgba(255,255,255,0.4)",
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Marcar como Apartado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Indica que este producto ya está reservado para un comprador
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isApartado}
                onClick={() => set("isApartado", !form.isApartado)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"
                style={{
                  background: form.isApartado
                    ? "#FFA500"
                    : "rgba(255,255,255,0.15)",
                  boxShadow: form.isApartado
                    ? "0 0 10px rgba(255,165,0,0.4)"
                    : undefined,
                }}
                data-ocid="toggle-apartado"
              >
                <span
                  className="pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform duration-200"
                  style={{
                    background: "#fff",
                    transform: form.isApartado
                      ? "translateX(20px)"
                      : "translateX(0)",
                  }}
                />
              </button>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirmInfo"
                  checked={confirmInfo}
                  onCheckedChange={(v) => {
                    setConfirmInfo(Boolean(v));
                    setErrors((prev) => ({ ...prev, confirm: undefined }));
                  }}
                  data-ocid="checkbox-confirm-info"
                />
                <Label
                  htmlFor="confirmInfo"
                  className="cursor-pointer leading-snug text-sm"
                >
                  Confirmo que la información es verídica y que no vendo
                  artículos prohibidos.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirmTerms"
                  checked={confirmTerms}
                  onCheckedChange={(v) => {
                    setConfirmTerms(Boolean(v));
                    setErrors((prev) => ({ ...prev, confirm: undefined }));
                  }}
                  data-ocid="checkbox-confirm-terms"
                />
                <Label
                  htmlFor="confirmTerms"
                  className="cursor-pointer leading-snug text-sm"
                >
                  He leído y acepto los Términos y Condiciones de Tijuana Shop
                  AE.
                </Label>
              </div>
              <FieldError msg={errors.confirm} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-1.5"
          data-ocid="btn-back"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {step === TOTAL_STEPS && (
            <Button
              variant="ghost"
              onClick={() => toast.info("Función próximamente disponible")}
              className="text-muted-foreground"
              data-ocid="btn-save-draft"
            >
              Guardar borrador
            </Button>
          )}

          {step < TOTAL_STEPS ? (
            <Button
              onClick={handleNext}
              className="gap-1.5"
              style={{
                background: "#00FFFF",
                color: "#000",
                boxShadow: "0 0 14px rgba(0,255,255,0.4)",
              }}
              data-ocid="btn-next"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={submitting || uploadingCount > 0}
              className="gap-2 min-w-[120px]"
              style={{
                background: "#00FFFF",
                color: "#000",
                boxShadow: "0 0 14px rgba(0,255,255,0.4)",
              }}
              data-ocid="btn-publish"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publicando…
                </>
              ) : uploadingCount > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo…
                </>
              ) : (
                "Publicar"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
