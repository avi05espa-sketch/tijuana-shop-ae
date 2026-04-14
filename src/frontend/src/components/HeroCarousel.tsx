import { OfficialLogo } from "@/components/OfficialLogo";
import { ChevronLeft, ChevronRight, Lock, MapPin, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── SVG Illustrations ──────────────────────────────────────────────────────────

const BUILDING_LIGHTS: [number, number][] = [
  [30, 140],
  [40, 160],
  [28, 180],
  [80, 100],
  [90, 125],
  [85, 150],
  [310, 130],
  [320, 155],
  [330, 110],
  [360, 120],
  [375, 145],
  [365, 170],
];

const PESO_SIGNS = [
  { id: "p1", x: 90, y: 80, size: 22, opacity: 0.6 },
  { id: "p2", x: 310, y: 70, size: 18, opacity: 0.5 },
  { id: "p3", x: 340, y: 150, size: 14, opacity: 0.4 },
  { id: "p4", x: 60, y: 160, size: 16, opacity: 0.4 },
];

const CARD_DIGITS = [165, 180, 195, 210, 225, 240, 255, 270];

const WAVE_OFFSETS = [0, 1, 2] as const;

const STAR_OFFSETS = [-8, -4, 0, 4, 8] as const;

// ── Brand Illustration: Official Logo centered ─────────────────────────────────

function BrandIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,255,255,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Decorative ring */}
      <div
        className="absolute"
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border: "1px solid rgba(0,255,255,0.12)",
          boxShadow: "0 0 30px rgba(0,255,255,0.06)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          border: "1px dashed rgba(0,255,255,0.07)",
        }}
      />
      <OfficialLogo size={120} className="relative z-10 drop-shadow-lg" />
    </div>
  );
}

function SafeDeliverySVG() {
  return (
    <svg
      viewBox="0 0 400 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
      role="img"
    >
      <title>Entrega segura en punto de encuentro</title>
      <rect width="400" height="260" fill="#060d10" />
      <rect x="0" y="160" width="60" height="100" fill="#081818" />
      <rect x="50" y="145" width="40" height="115" fill="#091a1a" />
      <rect x="310" y="155" width="50" height="105" fill="#081818" />
      <rect x="340" y="140" width="60" height="120" fill="#091a1a" />
      <rect x="0" y="220" width="400" height="40" fill="#071212" />
      <rect x="0" y="218" width="400" height="2" fill="rgba(0,200,200,0.15)" />
      <ellipse cx="200" cy="225" rx="90" ry="12" fill="rgba(0,255,255,0.06)" />
      {/* Shield */}
      <path
        d="M200 50 L240 68 L240 110 Q240 138 200 155 Q160 138 160 110 L160 68 Z"
        fill="rgba(0,255,255,0.08)"
        stroke="rgba(0,255,255,0.5)"
        strokeWidth="2"
      />
      <path
        d="M200 60 L232 75 L232 110 Q232 132 200 147 Q168 132 168 110 L168 75 Z"
        fill="rgba(0,255,255,0.05)"
      />
      <path
        d="M185 103 L196 115 L218 90"
        stroke="#00FFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M200 50 L240 68 L240 110 Q240 138 200 155 Q160 138 160 110 L160 68 Z"
        fill="none"
        stroke="rgba(0,255,255,0.2)"
        strokeWidth="8"
      />
      {/* Left person */}
      <circle
        cx="130"
        cy="175"
        r="14"
        fill="#0d2525"
        stroke="rgba(0,255,255,0.4)"
        strokeWidth="1.5"
      />
      <circle
        cx="130"
        cy="167"
        r="6"
        fill="#0d2525"
        stroke="rgba(0,255,255,0.3)"
        strokeWidth="1"
      />
      <path
        d="M116 195 Q130 185 144 195"
        stroke="rgba(0,255,255,0.4)"
        strokeWidth="2"
        fill="none"
      />
      {/* Right person */}
      <circle
        cx="270"
        cy="175"
        r="14"
        fill="#0d2525"
        stroke="rgba(0,200,255,0.4)"
        strokeWidth="1.5"
      />
      <circle
        cx="270"
        cy="167"
        r="6"
        fill="#0d2525"
        stroke="rgba(0,200,255,0.3)"
        strokeWidth="1"
      />
      <path
        d="M256 195 Q270 185 284 195"
        stroke="rgba(0,200,255,0.4)"
        strokeWidth="2"
        fill="none"
      />
      {/* Handshake line */}
      <line
        x1="144"
        y1="178"
        x2="256"
        y2="178"
        stroke="rgba(0,255,255,0.3)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      <circle cx="200" cy="178" r="5" fill="rgba(0,255,255,0.4)" />
      {/* Map pin */}
      <path
        d="M200 40 Q200 20 220 20 Q240 20 240 40 Q240 60 200 80 Q160 60 160 40 Q160 20 180 20 Q200 20 200 40Z"
        fill="rgba(0,255,255,0.1)"
        stroke="rgba(0,255,255,0.5)"
        strokeWidth="1.5"
      />
      <circle cx="200" cy="40" r="5" fill="#00FFFF" />
      <ellipse cx="200" cy="103" rx="45" ry="55" fill="rgba(0,255,255,0.03)" />
    </svg>
  );
}

function SecurePaymentSVG() {
  return (
    <svg
      viewBox="0 0 400 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
      role="img"
    >
      <title>Pagos seguros</title>
      <rect width="400" height="260" fill="#060d08" />
      <ellipse
        cx="200"
        cy="130"
        rx="150"
        ry="100"
        fill="rgba(0,255,128,0.03)"
      />
      {/* Padlock */}
      <rect
        x="155"
        y="120"
        width="90"
        height="80"
        rx="10"
        fill="rgba(0,200,100,0.08)"
        stroke="rgba(0,255,128,0.5)"
        strokeWidth="2"
      />
      <path
        d="M175 120 L175 95 Q175 65 200 65 Q225 65 225 95 L225 120"
        stroke="rgba(0,255,128,0.6)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M175 120 L175 95 Q175 65 200 65 Q225 65 225 95 L225 120"
        stroke="rgba(0,255,128,0.2)"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx="200"
        cy="150"
        r="10"
        fill="rgba(0,255,128,0.2)"
        stroke="rgba(0,255,128,0.5)"
        strokeWidth="1.5"
      />
      <rect
        x="196"
        y="155"
        width="8"
        height="20"
        rx="2"
        fill="rgba(0,255,128,0.4)"
      />
      {/* Peso signs */}
      {PESO_SIGNS.map((p) => (
        <text
          key={p.id}
          x={p.x}
          y={p.y}
          fontSize={p.size}
          fill={`rgba(0,255,128,${p.opacity})`}
          fontWeight="bold"
          textAnchor="middle"
        >
          $
        </text>
      ))}
      {/* Credit card */}
      <rect
        x="110"
        y="200"
        width="180"
        height="45"
        rx="6"
        fill="rgba(0,50,30,0.5)"
        stroke="rgba(0,255,128,0.3)"
        strokeWidth="1.5"
      />
      <rect
        x="110"
        y="213"
        width="180"
        height="8"
        fill="rgba(0,255,128,0.06)"
      />
      <circle
        cx="145"
        cy="222"
        r="7"
        fill="rgba(0,200,100,0.3)"
        stroke="rgba(0,255,128,0.4)"
        strokeWidth="1"
      />
      <circle
        cx="157"
        cy="222"
        r="7"
        fill="rgba(0,150,80,0.3)"
        stroke="rgba(0,255,128,0.3)"
        strokeWidth="1"
      />
      {CARD_DIGITS.map((x) => (
        <rect
          key={`digit-${x}`}
          x={x}
          y="234"
          width="8"
          height="4"
          rx="1"
          fill="rgba(255,255,255,0.15)"
        />
      ))}
      {/* Digital waves left */}
      {WAVE_OFFSETS.map((i) => (
        <path
          key={`wl-${i}`}
          d={`M${70 + i * 10} 130 Q${120 + i * 10} ${115 + i * 5} ${170 + i * 10} 130`}
          stroke={`rgba(0,255,128,${0.2 - i * 0.05})`}
          strokeWidth="1.5"
          fill="none"
        />
      ))}
      {/* Digital waves right */}
      {WAVE_OFFSETS.map((i) => (
        <path
          key={`wr-${i}`}
          d={`M${230 - i * 10} 130 Q${280 - i * 10} ${115 + i * 5} ${330 - i * 10} 130`}
          stroke={`rgba(0,255,128,${0.2 - i * 0.05})`}
          strokeWidth="1.5"
          fill="none"
        />
      ))}
      {/* Top shield */}
      <path
        d="M200 25 L220 33 L220 52 Q220 65 200 72 Q180 65 180 52 L180 33 Z"
        fill="rgba(0,255,128,0.1)"
        stroke="rgba(0,255,128,0.4)"
        strokeWidth="1.5"
      />
      <path
        d="M192 48 L198 55 L210 42"
        stroke="rgba(0,255,128,0.8)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Building lights for ambience */}
      {BUILDING_LIGHTS.map(([x, y], i) => (
        <rect
          key={`light-${x}-${y}`}
          x={x}
          y={y}
          width="4"
          height="3"
          rx="0.5"
          fill={i % 3 === 0 ? "rgba(0,255,128,0.3)" : "rgba(255,255,200,0.2)"}
        />
      ))}
    </svg>
  );
}

function CommunityTrustSVG() {
  return (
    <svg
      viewBox="0 0 400 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
      role="img"
    >
      <title>Comunidad confiable de Tijuana</title>
      <rect width="400" height="260" fill="#06080d" />
      {/* Connection lines */}
      <line
        x1="200"
        y1="130"
        x2="100"
        y2="80"
        stroke="rgba(0,180,255,0.2)"
        strokeWidth="1.5"
      />
      <line
        x1="200"
        y1="130"
        x2="300"
        y2="80"
        stroke="rgba(0,180,255,0.2)"
        strokeWidth="1.5"
      />
      <line
        x1="200"
        y1="130"
        x2="80"
        y2="180"
        stroke="rgba(0,180,255,0.15)"
        strokeWidth="1.5"
      />
      <line
        x1="200"
        y1="130"
        x2="320"
        y2="180"
        stroke="rgba(0,180,255,0.15)"
        strokeWidth="1.5"
      />
      <line
        x1="100"
        y1="80"
        x2="300"
        y2="80"
        stroke="rgba(0,180,255,0.1)"
        strokeWidth="1"
        strokeDasharray="5 4"
      />
      <line
        x1="80"
        y1="180"
        x2="320"
        y2="180"
        stroke="rgba(0,180,255,0.1)"
        strokeWidth="1"
        strokeDasharray="5 4"
      />
      {/* Center profile */}
      <circle
        cx="200"
        cy="130"
        r="32"
        fill="rgba(0,180,255,0.08)"
        stroke="rgba(0,200,255,0.5)"
        strokeWidth="2"
      />
      <circle
        cx="200"
        cy="120"
        r="12"
        fill="#0a1a2a"
        stroke="rgba(0,200,255,0.4)"
        strokeWidth="1.5"
      />
      <path
        d="M176 148 Q200 138 224 148"
        stroke="rgba(0,200,255,0.4)"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="222"
        cy="112"
        r="10"
        fill="#061218"
        stroke="rgba(0,255,200,0.6)"
        strokeWidth="1.5"
      />
      <path
        d="M216 112 L220 116 L228 108"
        stroke="#00FFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top-left profile */}
      <circle
        cx="100"
        cy="80"
        r="22"
        fill="rgba(0,180,255,0.06)"
        stroke="rgba(0,180,255,0.35)"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="72"
        r="8"
        fill="#0a1a2a"
        stroke="rgba(0,180,255,0.3)"
        strokeWidth="1"
      />
      <path
        d="M83 93 Q100 86 117 93"
        stroke="rgba(0,180,255,0.3)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="118"
        cy="65"
        r="7"
        fill="#061218"
        stroke="rgba(0,255,180,0.5)"
        strokeWidth="1.2"
      />
      <path
        d="M114 65 L117 68 L123 62"
        stroke="#00FFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top-right profile */}
      <circle
        cx="300"
        cy="80"
        r="22"
        fill="rgba(0,180,255,0.06)"
        stroke="rgba(0,180,255,0.35)"
        strokeWidth="1.5"
      />
      <circle
        cx="300"
        cy="72"
        r="8"
        fill="#0a1a2a"
        stroke="rgba(0,180,255,0.3)"
        strokeWidth="1"
      />
      <path
        d="M283 93 Q300 86 317 93"
        stroke="rgba(0,180,255,0.3)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="318"
        cy="65"
        r="7"
        fill="#061218"
        stroke="rgba(0,255,180,0.5)"
        strokeWidth="1.2"
      />
      <path
        d="M314 65 L317 68 L323 62"
        stroke="#00FFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom-left profile */}
      <circle
        cx="80"
        cy="190"
        r="18"
        fill="rgba(0,180,255,0.05)"
        stroke="rgba(0,150,255,0.3)"
        strokeWidth="1.5"
      />
      <circle
        cx="80"
        cy="183"
        r="7"
        fill="#0a1a2a"
        stroke="rgba(0,150,255,0.25)"
        strokeWidth="1"
      />
      <path
        d="M65 200 Q80 195 95 200"
        stroke="rgba(0,150,255,0.3)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Bottom-right profile */}
      <circle
        cx="320"
        cy="190"
        r="18"
        fill="rgba(0,180,255,0.05)"
        stroke="rgba(0,150,255,0.3)"
        strokeWidth="1.5"
      />
      <circle
        cx="320"
        cy="183"
        r="7"
        fill="#0a1a2a"
        stroke="rgba(0,150,255,0.25)"
        strokeWidth="1"
      />
      <path
        d="M305 200 Q320 195 335 200"
        stroke="rgba(0,150,255,0.3)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Star ratings */}
      {STAR_OFFSETS.map((offset, i) => (
        <polygon
          key={`star-rating-${offset}`}
          points={`${200 + offset * 5},218 ${201 + offset * 5},221 ${204 + offset * 5},221 ${202 + offset * 5},223 ${203 + offset * 5},226 ${200 + offset * 5},224 ${197 + offset * 5},226 ${198 + offset * 5},223 ${196 + offset * 5},221 ${199 + offset * 5},221`}
          fill={i < 4 ? "rgba(0,255,200,0.7)" : "rgba(255,255,255,0.15)"}
        />
      ))}
      <circle cx="200" cy="130" r="45" fill="rgba(0,200,255,0.03)" />
      <circle cx="200" cy="130" r="60" fill="rgba(0,200,255,0.015)" />
    </svg>
  );
}

// ── Slide Data ─────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: "slide-brand",
    badge: <OfficialLogo size={20} />,
    badgeLabel: "Tijuana Shop AE",
    title: "Compra y vende local en Tijuana",
    subtitle: "El mercado digital de la frontera — sin estafas, solo vecinos.",
    body: null as string | null,
    accentColor: "#00FFFF",
    illustration: <BrandIllustration />,
  },
  {
    id: "slide-delivery",
    badge: <MapPin className="w-5 h-5" style={{ color: "#00FFFF" }} />,
    badgeLabel: "Entrega Segura",
    title: "Entrega Segura en Puntos Medios",
    subtitle: null as string | null,
    body: "Para tu seguridad, acuerda siempre las entregas en lugares públicos y concurridos. Usa las delegaciones principales (Centro, Zona Río o Playas) y evita sitios solitarios. Confirma la cita con Avi Bot." as
      | string
      | null,
    accentColor: "#00E5FF",
    illustration: <SafeDeliverySVG />,
  },
  {
    id: "slide-payment",
    badge: <Lock className="w-5 h-5" style={{ color: "#00FFB0" }} />,
    badgeLabel: "Pagos Seguros",
    title: "Protección en tus Pagos",
    subtitle: null as string | null,
    body: "Nunca deposites dinero por adelantado sin ver el producto. Pago contra entrega (efectivo o transferencia en el momento). Tijuana Shop AE no se hace responsable de depósitos externos." as
      | string
      | null,
    accentColor: "#00FFB0",
    illustration: <SecurePaymentSVG />,
  },
  {
    id: "slide-community",
    badge: <Users className="w-5 h-5" style={{ color: "#00CFFF" }} />,
    badgeLabel: "Comunidad Confiable",
    title: "Trata Directamente con Tijuanenses",
    subtitle: null as string | null,
    body: "Revisa el perfil del vendedor antes de cualquier trato. Un vendedor confiable tiene foto y descripción clara. Si un anuncio parece 'demasiado bueno para ser verdad', repórtalo. ¡Construyamos juntos una comunidad segura!" as
      | string
      | null,
    accentColor: "#00CFFF",
    illustration: <CommunityTrustSVG />,
  },
];

// ── HeroCarousel ───────────────────────────────────────────────────────────────

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback((dir: 1 | -1) => {
    setCurrent((c) => (c + dir + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => advance(1), 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, advance]);

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        background: "#060d0d",
        border: "1px solid rgba(0,255,255,0.18)",
        boxShadow:
          "0 0 40px rgba(0,255,255,0.08), inset 0 0 60px rgba(0,0,0,0.4)",
        minHeight: "280px",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-ocid="hero-carousel"
      aria-roledescription="carrusel"
      aria-label="Información de Tijuana Shop AE"
    >
      {/* Slides */}
      {SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className="absolute inset-0 flex flex-col md:flex-row items-stretch transition-opacity duration-700"
          style={{
            opacity: idx === current ? 1 : 0,
            pointerEvents: idx === current ? "auto" : "none",
            background: "linear-gradient(135deg, #050e0e 0%, #060d12 100%)",
          }}
          aria-hidden={idx !== current}
          data-ocid={`carousel-slide-${idx}`}
        >
          {/* Text side */}
          <div
            className="flex flex-col justify-center gap-3 px-6 py-8 md:py-10 md:px-10 flex-1 min-w-0 z-10 relative"
            style={{
              background:
                "linear-gradient(to right, rgba(5,14,14,0.95) 0%, rgba(5,14,14,0.7) 80%, transparent 100%)",
            }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(0,255,255,0.08)",
                border: `1px solid ${s.accentColor}40`,
                color: s.accentColor,
              }}
            >
              {s.badge}
              {s.badgeLabel}
            </div>

            {/* Title */}
            <h2
              className="font-display font-bold text-xl md:text-2xl lg:text-3xl leading-tight text-foreground"
              style={{ textShadow: `0 0 30px ${s.accentColor}20` }}
            >
              {s.title}
            </h2>

            {/* Subtitle or body */}
            {s.subtitle && (
              <p
                className="text-sm md:text-base font-medium"
                style={{ color: s.accentColor }}
              >
                {s.subtitle}
              </p>
            )}
            {s.body && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                {s.body}
              </p>
            )}
          </div>

          {/* Illustration side */}
          <div
            className="w-full h-40 md:h-auto md:w-2/5 lg:w-[42%] shrink-0 relative overflow-hidden"
            style={{ opacity: 0.9 }}
            aria-hidden="true"
          >
            <div className="absolute inset-0">{s.illustration}</div>
            {/* Left fade on desktop */}
            <div
              className="absolute inset-0 hidden md:block"
              style={{
                background:
                  "linear-gradient(to right, rgba(5,14,14,0.8) 0%, transparent 35%)",
              }}
            />
          </div>
        </div>
      ))}

      {/* Prev arrow */}
      <button
        type="button"
        onClick={() => advance(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-smooth"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(0,255,255,0.25)",
          color: "rgba(0,255,255,0.8)",
        }}
        aria-label="Anterior"
        data-ocid="carousel-prev"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Next arrow */}
      <button
        type="button"
        onClick={() => advance(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-smooth"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(0,255,255,0.25)",
          color: "rgba(0,255,255,0.8)",
        }}
        aria-label="Siguiente"
        data-ocid="carousel-next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
        role="tablist"
        aria-label="Diapositivas del carrusel"
      >
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={idx === current}
            aria-label={`Diapositiva ${idx + 1}`}
            onClick={() => setCurrent(idx)}
            className="rounded-full transition-all duration-300"
            style={{
              width: idx === current ? "20px" : "8px",
              height: "8px",
              background:
                idx === current
                  ? SLIDES[idx].accentColor
                  : "rgba(255,255,255,0.25)",
              boxShadow:
                idx === current
                  ? `0 0 8px ${SLIDES[idx].accentColor}80`
                  : "none",
            }}
            data-ocid={`carousel-dot-${idx}`}
          />
        ))}
      </div>
    </div>
  );
}
