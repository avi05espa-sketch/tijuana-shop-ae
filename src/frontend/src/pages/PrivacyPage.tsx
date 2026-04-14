import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";

const SECTIONS = [
  {
    id: "recoleccion",
    title: "1. RECOLECCIÓN DE INFORMACIÓN",
    content:
      "En Tijuana Shop AE recolectamos información básica necesaria para el funcionamiento del sitio:\n\nVendedores: Nombre, número de teléfono (WhatsApp) y fotografías de los productos.\n\nUsuarios: Datos de inicio de sesión a través de Google (correo electrónico y nombre de perfil) para verificar la identidad del administrador o vendedor.",
  },
  {
    id: "uso-datos",
    title: "2. USO DE LOS DATOS",
    content:
      "La información recolectada se utiliza exclusivamente para:\n\nPublicar los anuncios en el catálogo.\n\nPermitir que los compradores contacten a los vendedores vía WhatsApp.\n\nMantener la seguridad del sitio y evitar perfiles falsos.",
  },
  {
    id: "visibilidad",
    title: "3. VISIBILIDAD DE LOS DATOS",
    content:
      "Al publicar un producto, el vendedor reconoce y acepta que su número de WhatsApp y nombre de contacto serán públicos dentro del sitio. Esto es indispensable para que los clientes puedan realizar compras.",
  },
  {
    id: "proteccion",
    title: "4. PROTECCIÓN DE LA INFORMACIÓN",
    content:
      "Tijuana Shop AE utiliza la infraestructura de Google Firebase para proteger tus datos. No vendemos, ni rentamos, ni compartimos bases de datos con empresas externas para fines publicitarios.",
  },
  {
    id: "cookies",
    title: "5. COOKIES Y TECNOLOGÍA",
    content:
      'Utilizamos "cookies" técnicas para mantener tu sesión activa y recordar tus preferencias de navegación. Estas no recolectan información personal privada de tu dispositivo.',
  },
  {
    id: "control-datos",
    title: "6. CONTROL DE TUS DATOS",
    content:
      "En cualquier momento, un vendedor puede solicitar la eliminación de sus productos publicados o de su cuenta de usuario contactando directamente al administrador Avi-Espa.",
  },
  {
    id: "terceros",
    title: "7. ENLACES A TERCEROS",
    content:
      "Nuestro sitio contiene botones que redirigen a WhatsApp. Una vez que el usuario sale de Tijuana Shop AE para ir a dicha aplicación, la privacidad de los datos se rige por las políticas de WhatsApp y Facebook.",
  },
  {
    id: "consentimiento",
    title: "8. CONSENTIMIENTO",
    content:
      "Al utilizar Tijuana Shop AE y subir contenido, otorgas tu consentimiento para el tratamiento de tus datos bajo estos términos.",
  },
];

export default function PrivacyPage() {
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
            data-ocid="privacy-back-btn"
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
              <Lock className="w-5 h-5" style={{ color: "#00FFFF" }} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                Políticas de Privacidad
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
          <p className="text-sm text-muted-foreground leading-relaxed">
            En Tijuana Shop AE, operado por{" "}
            <strong className="text-foreground">Avi-Espa</strong>, nos
            comprometemos a proteger tu privacidad y tratar tus datos personales
            con responsabilidad y transparencia.
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
              data-ocid={`toc-privacy-${s.id}`}
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
              data-ocid={`privacy-section-${section.id}`}
            >
              <h2 className="font-display font-bold text-base md:text-lg text-foreground">
                {section.title}
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
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
          <Lock
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: "#00FFFF" }}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong style={{ color: "rgba(255,255,255,0.85)" }}>
              Tijuana Shop AE ∩ Avispa Copyright 2026
            </strong>
            {" — "}
            Al utilizar esta plataforma, otorgas tu consentimiento para el
            tratamiento de tus datos bajo estas políticas.
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
            data-ocid="privacy-back-bottom-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}
