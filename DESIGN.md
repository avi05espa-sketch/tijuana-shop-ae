# Tijuana Shop AE — Design System

## Aesthetic & Tone
Industrial-tech marketplace with neon energy. Dark mode foundation (#0a0a0a base) with cyan (#00FFFF) as dominant accent. Trustworthy, modern, local. Minimal but purposeful — each element has visual feedback. Modern geometric sans-serif, no-nonsense.

## Color Palette (Dark Mode)

| Token | OKLCH | Usage |
|-------|-------|-------|
| Background | 0.07 0 0 | Page background (nearly black) |
| Foreground | 0.93 0 0 | Primary text (near white) |
| Card | 0.13 0 0 | Product cards, container backgrounds |
| Muted | 0.18 0 0 | Secondary backgrounds, sections |
| Accent (Cyan) | 0.7 0.25 259 | Buttons, borders, highlights, CTAs |
| Accent Foreground | 0.15 0 0 | Text on cyan accents |
| Destructive | 0.55 0.22 25 | Error states, cancel actions |
| Border | 0.25 0 0 | Subtle dividers |

## Typography

| Layer | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Display | Bricolage Grotesque | 2.5rem | 700 | Page titles, hero headings |
| Heading 1 | Bricolage Grotesque | 1.875rem | 700 | Section titles |
| Heading 2 | General Sans | 1.25rem | 600 | Subsections, card titles |
| Body | General Sans | 1rem | 400 | Body text, descriptions |
| Body Small | General Sans | 0.875rem | 400 | Secondary text, captions |
| Mono | Geist Mono | 0.875rem | 500 | Prices, codes, technical data |

## Shape Language
- Border radius: 8px (cards), 6px (buttons), 4px (small elements), 0 (badges)
- Stroke: 1px cyan at 15% opacity (borders), 40% on hover
- Spacing: 1rem base unit, 0.5rem increments
- Shadows: Glow-based (cyan 0.3–0.5 opacity), no traditional drop shadows

## Structural Zones

| Zone | Background | Border | Treatment |
|------|-----------|--------|-----------|
| Navbar (fixed) | 0.13 0 0 | Border-bottom 1px cyan 15% | Logo left, auth buttons right, hamburger <768px |
| Hero/Banner | 0.18 0 0 | Border cyan glow | "Seguridad y Confianza" headline, cyan accents |
| Product Grid | 0.07 0 0 (background) | Card 1px cyan 15% | 12 cards per row desktop, 2 rows mobile, hover lifts + glow |
| Category Filter | 0.13 0 0 | Accent cyan on active | Horizontal pills: Playas, Otay, Centro, Corredor 2000 |
| Sidebar (Admin) | 0.13 0 0 | Border-right 1px cyan 15% | Tabs: Dashboard, Usuarios, Productos, Reportes |
| Footer | 0.13 0 0 | Border-top 1px cyan 15% | Links, copyright, centered, muted text |

## Components & Interactions

**Buttons:** Accent cyan background, dark text. Hover: +glow shadow (0 0 20px cyan 50%). Active state: 40% opacity accent.

**Cards:** Border 1px cyan 15%, background card. Hover: border 40% opacity, glow shadow, lift 2px.

**Form inputs:** Border 1px border color, focus ring cyan accent (2px offset, 3px blur).

**Badge (Verificado/Top Vendedor):** Accent background, dark text, 4px radius, inline.

**Price display:** Mono font, size 1.25rem, cyan accent color for emphasis.

**Rating stars:** Accent cyan for filled, muted for empty.

## Animations

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Transition Smooth | 0.3s | cubic-bezier(0.4, 0, 0.2, 1) | All interactive states |
| Glow Pulse | 2s | ease-in-out | Featured products, key CTAs |
| Card Lift | 0.3s | smooth | Hover on product cards |
| Border Glow | 0.3s | smooth | Hover on interactive borders |

## Responsive Breakpoints

- Mobile: <768px (hamburger nav, single-column layout, full-width cards)
- Tablet: 768px–1024px (2-column grid, sidebar collapses)
- Desktop: 1024px+ (grid scales to 4 columns, fixed sidebar)

## Accessibility

- Contrast: All text ≥7:1 WCAG AAA on backgrounds
- Focus rings: 2px cyan ring, 3px offset, visible on all interactive elements
- Motion: Smooth easing, no disorienting effects, respects prefers-reduced-motion

## Distinctive Detail

Cyan glow on hover and focus states creates a "neon marketplace" feel — modern, tech-forward, and trustworthy. The glow intensity increases on interaction, providing clear visual feedback. Combined with geometric typography and ultra-dark background, the aesthetic is unmistakably Tijuana Shop AE.
