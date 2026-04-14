import type { UserProfile } from "@/backend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActorRef } from "@/hooks/use-backend";
import { UserRole } from "@/types/marketplace";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SectionCard } from "./SectionCard";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleLabel(role: UserRole): string {
  if (role === UserRole.admin) return "Administrador";
  if (role === UserRole.vendedor) return "Vendedor";
  return "Comprador";
}

interface IdentitySectionProps {
  user: UserProfile;
}

export function IdentitySection({ user }: IdentitySectionProps) {
  const { actor } = useActorRef();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth ?? "");
  const [username, setUsername] = useState(user.name ?? "");
  const [zone, setZone] = useState(user.zone ?? "");

  async function handleSave() {
    if (!actor) return;
    setSaving(true);
    try {
      await actor.updateProfile(
        name || null,
        email || null,
        user.avatarUrl ?? null,
        bio || null,
        zone || null,
        dateOfBirth || null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      );
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Perfil actualizado correctamente.");
    } catch {
      toast.error("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5" data-ocid="settings-identity">
      {/* Profile Summary */}
      <SectionCard title="Mi Perfil" icon="👤">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
          <Avatar
            className="w-16 h-16 shrink-0"
            style={{ border: "2px solid rgba(0,255,255,0.35)" }}
          >
            {user.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            )}
            <AvatarFallback
              className="text-lg font-bold"
              style={{ background: "rgba(0,255,255,0.1)", color: "#00FFFF" }}
            >
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-display font-bold text-lg text-foreground">
                {user.name}
              </h2>
              {user.verified && (
                <span title="Verificado" style={{ color: "#00FFFF" }}>
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={
                  user.role === UserRole.admin
                    ? {
                        background: "rgba(255,100,0,0.2)",
                        color: "#ff6400",
                        border: "1px solid rgba(255,100,0,0.4)",
                      }
                    : user.role === UserRole.vendedor
                      ? {
                          background: "rgba(0,255,255,0.12)",
                          color: "#00FFFF",
                          border: "1px solid rgba(0,255,255,0.35)",
                        }
                      : {
                          background: "rgba(255,255,255,0.07)",
                          color: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }
                }
              >
                {getRoleLabel(user.role)}
              </span>
              {user.zone && (
                <Badge
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
                  📍 {user.zone}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Editable Fields */}
      <SectionCard title="Editar Información" icon="✏️">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Nombre completo"
            value={name}
            onChange={setName}
            placeholder="Tu nombre"
            ocid="settings-field-name"
          />
          <FormField
            label="Nombre de usuario"
            value={username}
            onChange={setUsername}
            placeholder="@usuario"
            ocid="settings-field-username"
          />
          <FormField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="correo@ejemplo.com"
            ocid="settings-field-email"
          />
          <FormField
            label="Teléfono"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+52 664 000 0000"
            ocid="settings-field-phone"
          />
          <FormField
            label="Fecha de nacimiento"
            type="date"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            placeholder=""
            ocid="settings-field-birthdate"
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-field-zone"
              className="text-xs font-medium text-muted-foreground"
            >
              Zona en Tijuana
            </label>
            <select
              id="settings-field-zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="h-10 rounded-lg px-3 text-sm bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-accent/50 transition-smooth"
              data-ocid="settings-field-zone"
            >
              <option value="">Seleccionar zona</option>
              <option value="Playas de Tijuana">🌊 Playas de Tijuana</option>
              <option value="Otay">🏭 Otay</option>
              <option value="Centro">🏛️ Centro Histórico</option>
              <option value="Corredor 2000">🏙️ Corredor 2000</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5 mt-4">
          <label
            htmlFor="settings-field-bio"
            className="text-xs font-medium text-muted-foreground"
          >
            Biografía
          </label>
          <textarea
            id="settings-field-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntanos brevemente quién eres, qué vendes o en qué zona de Tijuana sueles entregar. ¡Esto genera confianza!"
            maxLength={300}
            rows={3}
            className="rounded-lg px-3 py-2.5 text-sm bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-accent/50 transition-smooth resize-none placeholder:text-muted-foreground"
            data-ocid="settings-field-bio"
          />
          <span className="text-xs text-muted-foreground text-right">
            {bio.length}/300
          </span>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-smooth disabled:opacity-50"
            style={{
              background: "#00FFFF",
              color: "#0a0a0a",
              boxShadow: "0 0 16px rgba(0,255,255,0.35)",
            }}
            data-ocid="settings-identity-save-btn"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Guardar cambios
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  ocid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  ocid: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={ocid}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={ocid}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg px-3 text-sm bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-accent/50 transition-smooth placeholder:text-muted-foreground"
        data-ocid={ocid}
      />
    </div>
  );
}
