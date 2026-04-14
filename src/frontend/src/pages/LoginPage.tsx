import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser, useRegisterUser } from "@/hooks/use-backend";
import { ProductZone, UserRole } from "@/types/marketplace";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Apple,
  CheckCircle2,
  Facebook,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Tijuana Bounds ───────────────────────────────────────────────────────────
const TJ_BOUNDS = {
  latMin: 32.3,
  latMax: 32.6,
  lonMin: -117.2,
  lonMax: -116.7,
};
function isInTijuana(lat: number, lon: number) {
  return (
    lat >= TJ_BOUNDS.latMin &&
    lat <= TJ_BOUNDS.latMax &&
    lon >= TJ_BOUNDS.lonMin &&
    lon <= TJ_BOUNDS.lonMax
  );
}

const ZONES = [
  { value: ProductZone.playas, label: "Playas de Tijuana" },
  { value: ProductZone.otay, label: "Otay" },
  { value: ProductZone.centro, label: "Centro Histórico" },
  { value: ProductZone.corredor2000, label: "Corredor 2000" },
];

type GeoStatus = "idle" | "checking" | "approved" | "rejected" | "denied";

// ─── Geo Verification Block ───────────────────────────────────────────────────
function GeoBlock({
  status,
  onCheck,
  fallback,
  onFallback,
}: {
  status: GeoStatus;
  onCheck: () => void;
  fallback: boolean;
  onFallback: (v: boolean) => void;
}) {
  const borderColor =
    status === "approved"
      ? "rgba(0,255,100,0.35)"
      : status === "rejected"
        ? "rgba(255,60,60,0.35)"
        : "rgba(0,255,255,0.25)";
  const bg =
    status === "approved"
      ? "rgba(0,255,100,0.06)"
      : status === "rejected"
        ? "rgba(255,60,60,0.06)"
        : "rgba(0,255,255,0.05)";
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: bg, border: `1.5px solid ${borderColor}` }}
      data-ocid="geo-verification-block"
    >
      <div className="flex items-center gap-2">
        <MapPin
          className="w-4 h-4 shrink-0"
          style={{
            color:
              status === "approved"
                ? "#00FF64"
                : status === "rejected"
                  ? "#FF3C3C"
                  : "#00FFFF",
          }}
        />
        <span className="text-sm font-semibold text-foreground">
          Verifica tu ubicación en Tijuana
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "rgba(0,255,255,0.1)",
            color: "#00FFFF",
            border: "1px solid rgba(0,255,255,0.2)",
          }}
        >
          Obligatoria
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Esta plataforma es exclusiva para residentes de Tijuana, B.C. Debes
        estar dentro del área.
      </p>
      {status === "idle" && (
        <Button
          type="button"
          onClick={onCheck}
          className="w-full h-10 text-sm font-semibold rounded-lg gap-2"
          style={{ background: "#00FFFF", color: "#0a0a0a" }}
          data-ocid="geo-check-btn"
        >
          <MapPin className="w-4 h-4" /> Verificar mi ubicación
        </Button>
      )}
      {status === "checking" && (
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ color: "#00FFFF" }}
          />
          <span className="text-sm text-muted-foreground">
            Detectando ubicación…
          </span>
        </div>
      )}
      {status === "approved" && (
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2
            className="w-5 h-5 shrink-0"
            style={{ color: "#00FF64" }}
          />
          <span style={{ color: "#00FF64" }}>
            ✓ Ubicación verificada — Tijuana, B.C.
          </span>
        </div>
      )}
      {status === "rejected" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <XCircle
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#FF3C3C" }}
            />
            <p className="text-xs leading-relaxed" style={{ color: "#FF3C3C" }}>
              Tu ubicación está fuera de Tijuana. Esta plataforma es exclusiva
              para residentes.
            </p>
          </div>
          <Button
            type="button"
            onClick={onCheck}
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1.5"
            data-ocid="geo-retry-btn"
          >
            <MapPin className="w-3.5 h-3.5" /> Intentar de nuevo
          </Button>
        </div>
      )}
      {status === "denied" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: "rgba(0,255,255,0.7)" }}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              No se pudo acceder a tu ubicación. Activa los permisos o confirma
              manualmente.
            </p>
          </div>
          <div className="flex gap-2.5 items-start">
            <Checkbox
              id="geo-fallback"
              checked={fallback}
              onCheckedChange={(v) => onFallback(!!v)}
              className="mt-0.5"
              data-ocid="geo-fallback-checkbox"
            />
            <Label
              htmlFor="geo-fallback"
              className="text-xs leading-relaxed cursor-pointer"
            >
              Confirmo que soy residente de <strong>Tijuana, México</strong> *
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Social Buttons ───────────────────────────────────────────────────────────
const SOCIALS = [
  { id: "google", label: "Google", icon: "G", color: "#EA4335" },
  { id: "phone", label: "Teléfono", icon: null, lucide: "phone" },
  { id: "apple", label: "Apple", icon: null, lucide: "apple" },
  { id: "facebook", label: "Facebook", icon: null, lucide: "facebook" },
  { id: "microsoft", label: "Microsoft", icon: "M", color: "#00A4EF" },
];

function SocialButtons() {
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneNum, setPhoneNum] = useState("");

  function handleSocial(id: string) {
    if (id === "phone") {
      setPhoneMode(true);
      return;
    }
    toast.info("Próximamente disponible 🚀", {
      description: "Este método de acceso estará disponible pronto.",
    });
  }

  if (phoneMode) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground text-center">
          Ingresa tu número de teléfono
        </p>
        <Input
          value={phoneNum}
          onChange={(e) => setPhoneNum(e.target.value)}
          placeholder="+52 664 000 0000"
          type="tel"
          className="text-center"
          data-ocid="phone-login-input"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setPhoneMode(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            style={{ background: "#00FFFF", color: "#0a0a0a" }}
            onClick={() => toast.info("Verificación por SMS próximamente.")}
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {SOCIALS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => handleSocial(s.id)}
          className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-xs font-medium transition-smooth hover:border-accent/40"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
          data-ocid={`social-btn-${s.id}`}
        >
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {s.id === "phone" && (
              <Phone className="w-4 h-4" style={{ color: "#00FFFF" }} />
            )}
            {s.id === "apple" && <Apple className="w-4 h-4" />}
            {s.id === "facebook" && (
              <Facebook className="w-4 h-4" style={{ color: "#1877F2" }} />
            )}
            {s.id === "google" && (
              <span style={{ color: s.color }} className="font-black text-base">
                G
              </span>
            )}
            {s.id === "microsoft" && (
              <span style={{ color: s.color }} className="font-black text-base">
                M
              </span>
            )}
          </span>
          <span className="text-muted-foreground text-[10px]">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, loginStatus } = useInternetIdentity();
  const { isAuthenticated, user, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && user) navigate({ to: "/" });
  }, [isAuthenticated, user, isLoading, navigate]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Ingresa tu correo y contraseña.");
      return;
    }
    setSubmitting(true);
    try {
      await login();
      onSuccess();
    } catch {
      toast.error("Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          autoComplete="email"
          data-ocid="login-email-input"
          style={{ borderColor: email ? "rgba(0,255,255,0.4)" : undefined }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          data-ocid="login-password-input"
          style={{ borderColor: password ? "rgba(0,255,255,0.4)" : undefined }}
        />
      </div>
      <button
        type="button"
        className="text-xs self-end transition-smooth"
        style={{ color: "rgba(0,255,255,0.7)" }}
        data-ocid="forgot-password-btn"
        onClick={() => toast.info("Recuperación de contraseña próximamente.")}
      >
        ¿Olvidaste tu contraseña?
      </button>
      <Button
        type="submit"
        disabled={submitting || loginStatus === "logging-in"}
        className="w-full h-12 font-semibold text-base rounded-xl gap-2"
        style={{ background: "#00FFFF", color: "#0a0a0a" }}
        data-ocid="login-submit-btn"
      >
        {submitting || loginStatus === "logging-in" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Mail className="w-5 h-5" /> Iniciar Sesión
          </>
        )}
      </Button>
      <div className="flex items-center gap-3 my-1">
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          — o continúa con —
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
      </div>
      <SocialButtons />
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm() {
  const navigate = useNavigate();
  const { login, loginStatus } = useInternetIdentity();
  const { isAuthenticated, user, isLoading } = useCurrentUser();
  const registerUser = useRegisterUser();

  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoFallback, setGeoFallback] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmar: "",
    telefono: "",
    zona: ProductZone.centro as ProductZone,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"identity" | "form">("identity");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (user) navigate({ to: "/" });
      else setStep("form");
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  function handleGeoCheck() {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("checking");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGeoStatus(
          isInTijuana(pos.coords.latitude, pos.coords.longitude)
            ? "approved"
            : "rejected",
        ),
      () => setGeoStatus("denied"),
      { timeout: 10000, enableHighAccuracy: false },
    );
  }

  const geoOk =
    geoStatus === "approved" || (geoStatus === "denied" && geoFallback);

  function field(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k])
      setErrors((e) => {
        const n = { ...e };
        delete n[k];
        return n;
      });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres.";
    if (!form.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = "Correo inválido.";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres.";
    if (form.password !== form.confirmar)
      e.confirmar = "Las contraseñas no coinciden.";
    if (!form.telefono.trim()) e.telefono = "El teléfono es obligatorio.";
    return e;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (!termsAccepted || !geoOk) return;
    try {
      await login();
      await registerUser.mutateAsync({
        name: form.nombre.trim(),
        phone: form.telefono.trim(),
        email: form.correo,
        zone: form.zona,
        role: UserRole.comprador,
      });
      toast.success("¡Bienvenido a Tijuana Shop AE! Tu cuenta fue creada.");
      navigate({ to: "/" });
    } catch {
      toast.error("Error al crear la cuenta. Intenta de nuevo.");
    }
  }

  // Step 1: connect identity
  if (step === "identity") {
    return (
      <div className="flex flex-col gap-4">
        {/* Geo first */}
        <GeoBlock
          status={geoStatus}
          onCheck={handleGeoCheck}
          fallback={geoFallback}
          onFallback={setGeoFallback}
        />

        {geoOk && (
          <div className="flex flex-col gap-4">
            {/* Fields */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-nombre">Nombre completo *</Label>
              <Input
                id="reg-nombre"
                value={form.nombre}
                onChange={(e) => field("nombre", e.target.value)}
                placeholder="Ej. María García"
                autoComplete="name"
                data-ocid="reg-nombre-input"
                className={errors.nombre ? "border-destructive" : ""}
                style={
                  !errors.nombre && form.nombre
                    ? { borderColor: "rgba(0,255,255,0.4)" }
                    : undefined
                }
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-correo">Correo electrónico *</Label>
              <Input
                id="reg-correo"
                type="email"
                value={form.correo}
                onChange={(e) => field("correo", e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                data-ocid="reg-correo-input"
                className={errors.correo ? "border-destructive" : ""}
                style={
                  !errors.correo && form.correo
                    ? { borderColor: "rgba(0,255,255,0.4)" }
                    : undefined
                }
              />
              {errors.correo && (
                <p className="text-xs text-destructive">{errors.correo}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-password">Contraseña *</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => field("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  data-ocid="reg-password-input"
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-confirmar">Confirmar *</Label>
                <Input
                  id="reg-confirmar"
                  type="password"
                  value={form.confirmar}
                  onChange={(e) => field("confirmar", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  data-ocid="reg-confirmar-input"
                  className={errors.confirmar ? "border-destructive" : ""}
                />
                {errors.confirmar && (
                  <p className="text-xs text-destructive">{errors.confirmar}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-telefono">Número de teléfono *</Label>
              <Input
                id="reg-telefono"
                type="tel"
                value={form.telefono}
                onChange={(e) => field("telefono", e.target.value)}
                placeholder="664-XXX-XXXX"
                autoComplete="tel"
                data-ocid="reg-telefono-input"
                className={errors.telefono ? "border-destructive" : ""}
                style={
                  !errors.telefono && form.telefono
                    ? { borderColor: "rgba(0,255,255,0.4)" }
                    : undefined
                }
              />
              {errors.telefono && (
                <p className="text-xs text-destructive">{errors.telefono}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reg-zona">Zona en Tijuana</Label>
              <select
                id="reg-zona"
                value={form.zona}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    zona: e.target.value as ProductZone,
                  }))
                }
                className="h-10 rounded-lg px-3 text-sm bg-card border text-foreground outline-none focus:ring-2 transition-smooth"
                style={{ borderColor: "rgba(0,255,255,0.3)" }}
                data-ocid="reg-zona-select"
              >
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>

            {/* T&C */}
            <div className="flex gap-3 items-start">
              <Checkbox
                id="reg-terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(!!v)}
                className="mt-0.5"
                data-ocid="reg-terms-checkbox"
              />
              <Label
                htmlFor="reg-terms"
                className="text-xs leading-relaxed cursor-pointer"
              >
                Acepto los{" "}
                <a
                  href="/terminos"
                  className="underline"
                  style={{ color: "#00FFFF" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Términos y Condiciones
                </a>{" "}
                y la{" "}
                <a
                  href="/privacidad"
                  className="underline"
                  style={{ color: "#00FFFF" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Privacidad
                </a>
                . Al registrarme acepto pagar{" "}
                <strong style={{ color: "#00FFFF" }}>$50 MXN</strong> de multa
                si no asisto a una cita confirmada. *
              </Label>
            </div>

            <Button
              type="button"
              onClick={handleRegister}
              disabled={
                !termsAccepted ||
                registerUser.isPending ||
                loginStatus === "logging-in"
              }
              className="w-full h-12 font-semibold text-base rounded-xl gap-2 mt-1"
              style={{
                background: termsAccepted ? "#00FFFF" : "rgba(0,255,255,0.2)",
                color: termsAccepted ? "#0a0a0a" : "rgba(0,255,255,0.5)",
              }}
              data-ocid="reg-submit-btn"
            >
              {registerUser.isPending || loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>

            <div className="flex items-center gap-3 my-1">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                — o regístrate con —
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
            </div>
            <SocialButtons />
          </div>
        )}
      </div>
    );
  }

  // Step 2 (after identity): register form
  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg2-nombre">Nombre completo *</Label>
        <Input
          id="reg2-nombre"
          value={form.nombre}
          onChange={(e) => field("nombre", e.target.value)}
          placeholder="Ej. María García"
          data-ocid="reg2-nombre-input"
          className={errors.nombre ? "border-destructive" : ""}
        />
        {errors.nombre && (
          <p className="text-xs text-destructive">{errors.nombre}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg2-telefono">Teléfono *</Label>
        <Input
          id="reg2-telefono"
          type="tel"
          value={form.telefono}
          onChange={(e) => field("telefono", e.target.value)}
          placeholder="664-XXX-XXXX"
          data-ocid="reg2-telefono-input"
          className={errors.telefono ? "border-destructive" : ""}
        />
        {errors.telefono && (
          <p className="text-xs text-destructive">{errors.telefono}</p>
        )}
      </div>
      <GeoBlock
        status={geoStatus}
        onCheck={handleGeoCheck}
        fallback={geoFallback}
        onFallback={setGeoFallback}
      />
      <div className="flex gap-3 items-start">
        <Checkbox
          id="reg2-terms"
          checked={termsAccepted}
          onCheckedChange={(v) => setTermsAccepted(!!v)}
          className="mt-0.5"
          data-ocid="reg2-terms-checkbox"
        />
        <Label
          htmlFor="reg2-terms"
          className="text-xs leading-relaxed cursor-pointer"
        >
          Acepto los{" "}
          <a
            href="/terminos"
            className="underline"
            style={{ color: "#00FFFF" }}
            target="_blank"
            rel="noreferrer"
          >
            Términos
          </a>{" "}
          y la{" "}
          <a
            href="/privacidad"
            className="underline"
            style={{ color: "#00FFFF" }}
            target="_blank"
            rel="noreferrer"
          >
            Privacidad
          </a>{" "}
          *
        </Label>
      </div>
      <Button
        type="submit"
        disabled={!termsAccepted || !geoOk || registerUser.isPending}
        className="w-full h-12 font-semibold text-base rounded-xl"
        style={{ background: "#00FFFF", color: "#0a0a0a" }}
        data-ocid="reg2-submit-btn"
      >
        {registerUser.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : null}
        Completar Registro
      </Button>
    </form>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────
function WelcomeScreen({
  onContinue,
}: { onContinue: (tab: "login" | "register") => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(0,255,255,0.1)",
            border: "1.5px solid rgba(0,255,255,0.35)",
            boxShadow: "0 0 32px rgba(0,255,255,0.2)",
          }}
        >
          <Store className="w-10 h-10" style={{ color: "#00FFFF" }} />
        </div>
        <h1
          className="font-display font-bold text-2xl md:text-3xl text-foreground"
          style={{ textShadow: "0 0 30px rgba(0,255,255,0.25)" }}
        >
          Bienvenido a <span style={{ color: "#00FFFF" }}>Tijuana Shop AE</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          El marketplace exclusivo para Tijuana.
          <br />
          Compra y vende con total confianza.
        </p>
      </div>

      {/* Single action CTAs */}
      <div className="w-full flex flex-col gap-3 mt-2">
        <button
          type="button"
          onClick={() => onContinue("login")}
          className="w-full py-4 rounded-2xl text-base font-bold transition-smooth"
          style={{
            background: "#00FFFF",
            color: "#0a0a0a",
            boxShadow: "0 0 24px rgba(0,255,255,0.35)",
          }}
          data-ocid="welcome-enter-btn"
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => onContinue("register")}
          className="w-full py-4 rounded-2xl text-base font-bold transition-smooth"
          style={{
            border: "2px solid rgba(0,255,255,0.6)",
            color: "#00FFFF",
            background: "rgba(0,255,255,0.06)",
          }}
          data-ocid="welcome-register-btn"
        >
          Crear Cuenta
        </button>
      </div>

      {/* Zone chips */}
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {["📍 Playas", "🏭 Otay", "🏛️ Centro", "🏙️ Corredor 2000"].map((z) => (
          <span
            key={z}
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: "rgba(0,255,255,0.08)",
              color: "rgba(0,255,255,0.7)",
              border: "1px solid rgba(0,255,255,0.2)",
            }}
          >
            {z}
          </span>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        ⚠️ Nunca compartas información bancaria en el chat.
      </p>
    </div>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [screen, setScreen] = useState<"welcome" | "auth">("welcome");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  function handleWelcomeContinue(tab: "login" | "register") {
    setActiveTab(tab);
    setScreen("auth");
  }

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,255,0.06) 0%, transparent 70%)",
      }}
    >
      <div className="w-full max-w-md flex flex-col gap-6">
        {screen === "welcome" ? (
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(0,255,255,0.15)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            }}
          >
            <WelcomeScreen onContinue={handleWelcomeContinue} />
          </div>
        ) : (
          <>
            {/* Back to welcome */}
            <button
              type="button"
              onClick={() => setScreen("welcome")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
              data-ocid="back-to-welcome-btn"
            >
              ← Volver
            </button>

            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,255,255,0.15)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
              }}
            >
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "login" | "register")}
                className="w-full"
              >
                <TabsList
                  className="w-full grid grid-cols-2 mb-6 rounded-xl h-11"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  data-ocid="auth-tabs"
                >
                  <TabsTrigger
                    value="login"
                    className="rounded-lg text-sm font-semibold data-[state=active]:text-[#00FFFF]"
                    data-ocid="tab-login"
                  >
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-lg text-sm font-semibold data-[state=active]:text-[#00FFFF]"
                    data-ocid="tab-register"
                  >
                    Crear Cuenta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <LoginForm onSuccess={() => {}} />
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Nunca compartas información bancaria en el chat.{" "}
              <a
                href="/terminos"
                style={{ color: "rgba(0,255,255,0.6)" }}
                className="underline"
              >
                Términos
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
