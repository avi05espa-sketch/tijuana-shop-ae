import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";

const SECTIONS = [
  {
    id: "aceptacion",
    title: "1. ACEPTACIÓN",
    content:
      "Al ingresar a Tijuana Shop AE, aceptas que este sitio es una plataforma de exhibición administrada por Avi-Espa. El uso del sitio implica la aceptación total de estas reglas.",
  },
  {
    id: "servicio",
    title: "2. EL SERVICIO",
    content:
      "Tijuana Shop AE funciona como un catálogo digital. Nosotros no vendemos los productos directamente ni cobramos comisiones por las ventas. Somos un puente entre el vendedor local y el cliente.",
  },
  {
    id: "publicaciones",
    title: "3. PUBLICACIONES",
    content:
      "Todo producto debe ser legal y real. El vendedor es responsable de la veracidad del precio y las fotos. Avi-Espa se reserva el derecho de borrar cualquier publicación que dañe la imagen del sitio o sea fraudulenta.",
  },
  {
    id: "privacidad-whatsapp",
    title: "4. PRIVACIDAD Y WHATSAPP",
    content:
      "Para facilitar la venta, el vendedor autoriza que su número de WhatsApp sea público. El trato y la negociación son responsabilidad exclusiva de las dos partes interesadas. Tijuana Shop AE no interviene en los acuerdos de pago o entrega.",
  },
  {
    id: "propiedad-intelectual",
    title: "5. PROPIEDAD INTELECTUAL",
    content:
      "El nombre, el diseño del sitio y el logotipo del Arco de Tijuana estilizado son propiedad de Avi-Espa. No se permite el uso de esta marca sin autorización previa.",
  },
  {
    id: "seguridad",
    title: "6. SEGURIDAD",
    content:
      "Recomendamos a todos los usuarios realizar sus entregas en lugares públicos y seguros de la ciudad de Tijuana. No nos hacemos responsables por incidentes ocurridos durante la compra-venta física.",
  },
  {
    id: "modificaciones",
    title: "7. MODIFICACIONES",
    content:
      "Estos términos pueden cambiar sin previo aviso para mejorar la seguridad de la comunidad de Avi-Espa.",
  },
];

export default function TermsPage() {
  const navigate = useNavigate();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div
        className="sticky top-0 z-10 py-3 px-4"
        style={{
          background: "rgba(10,10,10,0.95)",
          borderBottom: "1px solid rgba(0,255,255,0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="gap-2 text-muted-foreground hover:text-foreground"
            data-ocid="terms-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-10">
        {/* Title block */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(0,255,255,0.1)",
                border: "1px solid rgba(0,255,255,0.3)",
              }}
            >
              <Shield className="w-5 h-5" style={{ color: "#00FFFF" }} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                Términos y Condiciones
              </h1>
              <p
                className="font-display font-semibold text-lg"
                style={{ color: "#00FFFF" }}
              >
                TIJUANA SHOP AE
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Última actualización:{" "}
            <strong className="text-foreground">2026</strong>
          </p>
        </div>

        {/* Table of contents */}
        <nav
          className="rounded-xl p-5 flex flex-col gap-2"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
          aria-label="Tabla de contenidos"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            Contenido
          </p>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className="text-left text-sm transition-smooth py-1 px-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground"
              data-ocid={`toc-${s.id}`}
            >
              {s.title}
            </button>
          ))}
        </nav>

        <Separator style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="flex flex-col gap-3 scroll-mt-20"
              data-ocid={`terms-section-${section.id}`}
            >
              <h2 className="font-display font-bold text-base md:text-lg text-foreground">
                {section.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <Separator style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* Legal footer note */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(0,255,255,0.05)",
            border: "1px solid rgba(0,255,255,0.2)",
          }}
        >
          <Shield
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: "#00FFFF" }}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong style={{ color: "rgba(255,255,255,0.85)" }}>
              Tijuana Shop AE ∩ Avispa Copyright 2026
            </strong>
            {" — "}
            Todos los derechos reservados. El uso de esta plataforma implica la
            aceptación de estos términos.
          </p>
        </div>

        {/* Footer nav */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <p className="text-xs text-muted-foreground">
            Tijuana Shop AE ∩ Avispa Copyright 2026
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="gap-2"
            data-ocid="terms-back-bottom-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}
