interface OfficialLogoProps {
  size?: number;
  className?: string;
}

export function OfficialLogo({ size = 48, className }: OfficialLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <title>Tijuana Shop AE — Logo Oficial</title>

      {/* Defs: glow filter + gradient */}
      <defs>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="logo-soft-glow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="logo-bg-grad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#001a1a" />
          <stop offset="100%" stopColor="#000505" />
        </radialGradient>
        <linearGradient
          id="logo-border-grad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#00CCCC" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#009999" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Black circle background */}
      <circle cx="50" cy="50" r="48" fill="url(#logo-bg-grad)" />

      {/* Outer metallic glow ring */}
      <circle
        cx="50"
        cy="50"
        r="47.5"
        fill="none"
        stroke="url(#logo-border-grad)"
        strokeWidth="1.5"
        filter="url(#logo-glow)"
      />
      {/* Inner subtle border ring */}
      <circle
        cx="50"
        cy="50"
        r="44.5"
        fill="none"
        stroke="rgba(0,255,255,0.15)"
        strokeWidth="0.75"
      />

      {/* ── Arch silhouette (Arco de Tijuana) ── */}
      {/* Left pillar */}
      <rect x="30" y="52" width="7" height="22" rx="1" fill="#0d2a2a" />
      <rect
        x="30"
        y="50"
        width="7"
        height="3"
        rx="1"
        fill="rgba(0,255,255,0.5)"
      />
      {/* Right pillar */}
      <rect x="63" y="52" width="7" height="22" rx="1" fill="#0d2a2a" />
      <rect
        x="63"
        y="50"
        width="7"
        height="3"
        rx="1"
        fill="rgba(0,255,255,0.5)"
      />
      {/* Arch curve — glow halo */}
      <path
        d="M30 52 Q50 20 70 52"
        stroke="rgba(0,255,255,0.25)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      {/* Arch curve — mid glow */}
      <path
        d="M30 52 Q50 20 70 52"
        stroke="rgba(0,255,255,0.45)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Arch curve — bright core */}
      <path
        d="M30 52 Q50 20 70 52"
        stroke="#00FFFF"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        filter="url(#logo-glow)"
      />

      {/* ── Shopping bag overlaid on arch ── */}
      {/* Bag body */}
      <rect
        x="41"
        y="38"
        width="18"
        height="16"
        rx="2.5"
        fill="rgba(0,255,255,0.12)"
        stroke="#00FFFF"
        strokeWidth="1.5"
        filter="url(#logo-glow)"
      />
      {/* Bag handle */}
      <path
        d="M45 38 Q45 33 50 33 Q55 33 55 38"
        stroke="#00FFFF"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        filter="url(#logo-glow)"
      />
      {/* Bag highlight line */}
      <line
        x1="44"
        y1="43"
        x2="56"
        y2="43"
        stroke="rgba(0,255,255,0.35)"
        strokeWidth="1"
      />

      {/* ── Cursor / pen accent on top-right ── */}
      <path
        d="M66 28 L70 24 L73 27 L69 31 Z"
        fill="rgba(0,255,255,0.7)"
        stroke="#00FFFF"
        strokeWidth="0.5"
      />
      <line
        x1="69"
        y1="31"
        x2="67"
        y2="35"
        stroke="#00FFFF"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* ── Zone network dots ── */}
      {/* Playas — left */}
      <circle
        cx="18"
        cy="58"
        r="2.5"
        fill="rgba(0,255,255,0.6)"
        filter="url(#logo-glow)"
      />
      <text
        x="18"
        y="67"
        textAnchor="middle"
        fontSize="4.5"
        fill="rgba(0,255,255,0.55)"
        fontFamily="sans-serif"
      >
        Playas
      </text>
      {/* Centro — bottom center */}
      <circle
        cx="50"
        cy="80"
        r="2.5"
        fill="rgba(0,255,255,0.6)"
        filter="url(#logo-glow)"
      />
      <text
        x="50"
        y="89"
        textAnchor="middle"
        fontSize="4.5"
        fill="rgba(0,255,255,0.55)"
        fontFamily="sans-serif"
      >
        Centro
      </text>
      {/* Otay — bottom right */}
      <circle
        cx="76"
        cy="72"
        r="2.5"
        fill="rgba(0,255,255,0.5)"
        filter="url(#logo-glow)"
      />
      <text
        x="76"
        y="81"
        textAnchor="middle"
        fontSize="4.5"
        fill="rgba(0,255,255,0.5)"
        fontFamily="sans-serif"
      >
        Otay
      </text>
      {/* Corredor 2000 — top right */}
      <circle
        cx="80"
        cy="30"
        r="2"
        fill="rgba(0,200,255,0.5)"
        filter="url(#logo-glow)"
      />
      <text
        x="80"
        y="25"
        textAnchor="middle"
        fontSize="3.5"
        fill="rgba(0,200,255,0.5)"
        fontFamily="sans-serif"
      >
        C.2000
      </text>

      {/* Network lines between zones */}
      <line
        x1="18"
        y1="58"
        x2="50"
        y2="80"
        stroke="rgba(0,255,255,0.15)"
        strokeWidth="0.75"
        strokeDasharray="2 2"
      />
      <line
        x1="50"
        y1="80"
        x2="76"
        y2="72"
        stroke="rgba(0,255,255,0.12)"
        strokeWidth="0.75"
        strokeDasharray="2 2"
      />
      <line
        x1="76"
        y1="72"
        x2="80"
        y2="30"
        stroke="rgba(0,200,255,0.1)"
        strokeWidth="0.75"
        strokeDasharray="2 2"
      />

      {/* ── "TIJUANA SHOP AE" text ── */}
      <text
        x="50"
        y="97"
        textAnchor="middle"
        fontSize="7"
        fontWeight="bold"
        fill="#00FFFF"
        fontFamily="sans-serif"
        letterSpacing="0.5"
        filter="url(#logo-glow)"
      >
        TIJUANA SHOP AE
      </text>

      {/* ── Red subtitle banner ── */}
      <rect x="14" y="14" width="72" height="9" rx="1.5" fill="#cc1a1a" />
      <text
        x="50"
        y="20.5"
        textAnchor="middle"
        fontSize="5"
        fontWeight="bold"
        fill="white"
        fontFamily="sans-serif"
        letterSpacing="0.2"
      >
        TU MARKETPLACE LOCAL
      </text>
    </svg>
  );
}
