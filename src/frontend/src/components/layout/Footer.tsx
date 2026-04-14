import { OfficialLogo } from "@/components/OfficialLogo";
import { Link } from "@tanstack/react-router";
import { MapPin, Shield } from "lucide-react";

export function Footer() {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="bg-card border-t mt-auto"
      style={{ borderTopColor: "rgba(0,255,255,0.15)" }}
    >
      {/* Intermediary disclaimer line */}
      <div
        className="px-4 py-2.5 text-center"
        style={{
          background: "rgba(0,255,255,0.04)",
          borderBottom: "1px solid rgba(0,255,255,0.1)",
        }}
      >
        <p className="text-xs text-muted-foreground">
          <Shield
            className="inline w-3 h-3 mr-1 mb-0.5"
            style={{ color: "#00FFFF" }}
          />
          Tijuana Shop AE es solo un intermediario y no se hace responsable por
          los tratos directos entre usuarios.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <OfficialLogo size={36} className="shrink-0" />
              <span className="font-display font-bold text-lg text-foreground">
                Tijuana <span style={{ color: "#00FFFF" }}>Shop AE</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El marketplace de confianza en Tijuana. Compra y vende productos
              nuevos y usados de forma segura.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" style={{ color: "#00FFFF" }} />
              Tijuana, Baja California, México
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">
              Plataforma
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { to: "/", label: "Inicio" },
                { to: "/publicar", label: "Publicar Producto" },
                { to: "/favoritos", label: "Mis Favoritos" },
                { to: "/perfil", label: "Mi Perfil" },
                { to: "/puntos-entrega", label: "Entrega Segura" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { to: "/terminos", label: "Términos y Condiciones" },
                { to: "/privacidad", label: "Política de Privacidad" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Security badge */}
            <div
              className="mt-4 p-3 rounded-lg flex items-start gap-2"
              style={{
                background: "rgba(0,255,255,0.05)",
                border: "1px solid rgba(0,255,255,0.15)",
              }}
            >
              <Shield
                className="w-4 h-4 mt-0.5 shrink-0"
                style={{ color: "#00FFFF" }}
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Multa de{" "}
                <span className="text-foreground font-semibold">$50 MXN</span>{" "}
                por cancelación tardía. Respetamos el tiempo de todos.
              </p>
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3"
          style={{ borderTopColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            <span>Tijuana Shop AE ∩ Avispa Copyright 2026</span>
            <span className="hidden sm:inline mx-1">|</span>
            <br className="sm:hidden" />
            <span>Derechos Reservados Avi-Espa</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Hecho con ❤️ usando{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              style={{ color: "#00FFFF" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
