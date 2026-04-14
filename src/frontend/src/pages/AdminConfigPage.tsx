import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActorRef } from "@/hooks/use-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SiteConfig } from "../backend";

export default function AdminConfigPage() {
  const { actor, isFetching } = useActorRef();
  const qc = useQueryClient();

  const { data: config, isLoading } = useQuery<SiteConfig>({
    queryKey: ["siteConfig"],
    queryFn: async () => {
      if (!actor) throw new Error("No disponible");
      return actor.getConfig();
    },
    enabled: !!actor && !isFetching,
  });

  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [analyticsId, setAnalyticsId] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (config) {
      setSiteName(config.siteName);
      setSiteDescription(config.siteDescription);
      setLogoUrl(config.logoUrl);
      setContactEmail(config.contactEmail);
      setAnalyticsId(config.analyticsId);
      setMetaDescription(config.metaDescription);
      setMaintenanceMode(config.maintenanceMode);
    }
  }, [config]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No disponible");
      return actor.updateConfig(
        siteName || null,
        siteDescription || null,
        logoUrl || null,
        contactEmail || null,
        maintenanceMode,
        analyticsId || null,
        metaDescription || null,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["siteConfig"] });
      toast.success("Configuración guardada correctamente");
    },
    onError: () => toast.error("Error al guardar la configuración"),
  });

  if (isLoading) {
    return (
      <AdminLayout activeTab="configuracion">
        <div className="space-y-6 max-w-2xl">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="configuracion">
      <div className="space-y-8 max-w-2xl">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Configuración del Sitio
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Ajusta la información general, SEO y modo de mantenimiento
          </p>
        </div>

        {/* Site Info Section */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span>🌐</span> Información del Sitio
          </h3>

          <div className="space-y-2">
            <Label htmlFor="siteName" className="text-sm text-foreground">
              Nombre del sitio
            </Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Tijuana Shop AE"
              className="bg-background border-input text-foreground"
              data-ocid="config-site-name"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="siteDescription"
              className="text-sm text-foreground"
            >
              Descripción del sitio
            </Label>
            <Textarea
              id="siteDescription"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Marketplace local de Tijuana para comprar y vender productos…"
              className="bg-background border-input text-foreground resize-none"
              rows={3}
              data-ocid="config-site-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl" className="text-sm text-foreground">
              URL del logo
            </Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
              className="bg-background border-input text-foreground"
              data-ocid="config-logo-url"
            />
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="h-12 mt-2 rounded border border-border object-contain bg-muted/30 p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-sm text-foreground">
              Correo de contacto
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contacto@tijuanashopae.com"
              className="bg-background border-input text-foreground"
              data-ocid="config-contact-email"
            />
          </div>
        </section>

        {/* SEO Section */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span>🔍</span> SEO y Analítica
          </h3>

          <div className="space-y-2">
            <Label htmlFor="analyticsId" className="text-sm text-foreground">
              ID de Analytics
            </Label>
            <Input
              id="analyticsId"
              value={analyticsId}
              onChange={(e) => setAnalyticsId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="bg-background border-input text-foreground font-mono"
              data-ocid="config-analytics-id"
            />
            <p className="text-xs text-muted-foreground">
              ID de medición de Google Analytics 4
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="metaDescription"
              className="text-sm text-foreground"
            >
              Descripción meta (SEO)
            </Label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Compra y vende productos locales en Tijuana de forma segura…"
              className="bg-background border-input text-foreground resize-none"
              rows={3}
              data-ocid="config-meta-description"
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: entre 120 y 160 caracteres ({metaDescription.length}
              /160)
            </p>
          </div>
        </section>

        {/* Maintenance Section */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span>🔧</span> Modo Mantenimiento
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground font-medium">
                Activar modo mantenimiento
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Los usuarios normales no podrán acceder al sitio
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
              data-ocid="config-maintenance-toggle"
            />
          </div>

          {maintenanceMode && (
            <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
              <span className="text-yellow-400 text-lg shrink-0">⚠️</span>
              <p className="text-yellow-400 text-sm">
                <strong>Advertencia:</strong> El modo mantenimiento bloqueará el
                acceso a usuarios normales. Solo los administradores podrán
                entrar al sitio.
              </p>
            </div>
          )}
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            variant="outline"
            onClick={() => {
              if (config) {
                setSiteName(config.siteName);
                setSiteDescription(config.siteDescription);
                setLogoUrl(config.logoUrl);
                setContactEmail(config.contactEmail);
                setAnalyticsId(config.analyticsId);
                setMetaDescription(config.metaDescription);
                setMaintenanceMode(config.maintenanceMode);
              }
            }}
            className="border-border text-muted-foreground"
          >
            Descartar cambios
          </Button>
          <Button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-smooth"
            data-ocid="config-save"
          >
            {saveMut.isPending ? "Guardando…" : "Guardar Configuración"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
