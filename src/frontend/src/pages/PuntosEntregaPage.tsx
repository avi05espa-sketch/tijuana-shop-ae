import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import L from "leaflet";
import {
  ExternalLink,
  MapPin,
  Navigation,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────
interface PuntoEntrega {
  id: string;
  nombre: string;
  direccion: string;
  descripcionPunto: string;
  zona: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  imageAlt: string;
}

const PUNTOS: PuntoEntrega[] = [
  {
    id: "plaza-rio",
    nombre: "Plaza Río",
    direccion: "Paseo de los Héroes 96-98, Zona Río, Tijuana",
    descripcionPunto: "Frente al VIPS del Plaza Río",
    zona: "Zona Río",
    lat: 32.5268,
    lng: -116.9926,
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=32.5268,-116.9926",
    imageAlt: "Entrada principal Plaza Río, Tijuana",
  },
  {
    id: "macroplaza-otay",
    nombre: "Macroplaza Otay",
    direccion: "Blvd. Insurgentes 20116, Otay, Tijuana",
    descripcionPunto: "Macroplaza Otay — acceso principal",
    zona: "Otay",
    lat: 32.5448,
    lng: -116.987,
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=32.5448,-116.987",
    imageAlt: "Entrada Macroplaza Otay, Tijuana",
  },
  {
    id: "plaza-peninsula",
    nombre: "Plaza Península",
    direccion: "Blvd. Agua Caliente 4558, Chapultepec, Tijuana",
    descripcionPunto: "Frente al OXXO de la entrada principal",
    zona: "Chapultepec",
    lat: 32.5208,
    lng: -116.9946,
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=32.5208,-116.9946",
    imageAlt: "OXXO entrada Plaza Península, Tijuana",
  },
  {
    id: "galerias",
    nombre: "Centro Comercial Galerías",
    direccion: "Blvd. Agua Caliente 4500, Tijuana",
    descripcionPunto: "Frente a Cinépolis",
    zona: "Agua Caliente",
    lat: 32.5185,
    lng: -116.9908,
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=32.5185,-116.9908",
    imageAlt: "Frente a Cinépolis en Galerías Tijuana",
  },
  {
    id: "walmart-otay",
    nombre: "Walmart Otay",
    direccion: "Blvd. Insurgentes 22244, Otay, Tijuana",
    descripcionPunto: "Estacionamiento principal, junto al cajero automático",
    zona: "Otay",
    lat: 32.538,
    lng: -116.9808,
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=32.538,-116.9808",
    imageAlt: "Estacionamiento Walmart Otay, Tijuana",
  },
  {
    id: "la-cetto",
    nombre: "La Cetto",
    direccion: "Av. Cañón Johnson 2108, L.B. Johnson, Tijuana",
    descripcionPunto: "Frente al local principal de La Cetto",
    zona: "Lomas de La Presa",
    lat: 32.5154,
    lng: -117.0187,
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=32.5154,-117.0187",
    imageAlt: "Frente al local La Cetto, Tijuana",
  },
  {
    id: "parque-teniente-guerrero",
    nombre: "Parque Teniente Guerrero",
    direccion: "Av. Niños Héroes s/n, Centro, Tijuana",
    descripcionPunto: "Explanada principal del parque",
    zona: "Centro",
    lat: 32.5321,
    lng: -117.0295,
    googleMapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=32.5321,-117.0295",
    imageAlt: "Explanada Parque Teniente Guerrero, Centro Tijuana",
  },
];

// ─── Map Marker ───────────────────────────────────────────────────────────────
function createSafeMarker(active = false) {
  const glow = active ? "0 0 14px #00FFFFcc" : "0 0 8px #00FFFF88";
  const bg = active ? "#00FFFF" : "#00cccc";
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${bg};border:2px solid #0099bb;transform:rotate(-45deg);box-shadow:${glow};"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
  });
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function PuntosEntregaPage() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = PUNTOS.filter(
    (p) =>
      search.trim() === "" ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.zona.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcionPunto.toLowerCase().includes(search.toLowerCase()),
  );

  // Init map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [32.5149, -117.0382],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap contributors © CARTO",
        maxZoom: 19,
      },
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add markers
    for (const punto of PUNTOS) {
      const marker = L.marker([punto.lat, punto.lng], {
        icon: createSafeMarker(false),
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:160px;">
          <strong style="color:#00FFFF;font-size:13px;">${punto.nombre}</strong>
          <p style="color:#ccc;font-size:11px;margin:4px 0 2px;">${punto.descripcionPunto}</p>
          <p style="color:#999;font-size:10px;margin:0;">${punto.zona}</p>
        </div>`,
        { className: "dark-popup" },
      );

      marker.on("click", () => {
        setActiveId(punto.id);
        // scroll to card
        const el = document.getElementById(`card-${punto.id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

      markersRef.current[punto.id] = marker;
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker styles when activeId changes
  useEffect(() => {
    for (const [id, marker] of Object.entries(markersRef.current)) {
      marker.setIcon(createSafeMarker(id === activeId));
    }
  }, [activeId]);

  const flyToPoint = (punto: PuntoEntrega) => {
    setActiveId(punto.id);
    mapRef.current?.flyTo([punto.lat, punto.lng], 16, { duration: 1.2 });
    markersRef.current[punto.id]?.openPopup();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Security Banner ──────────────────────────────────────────────── */}
      <div
        className="sticky top-[64px] z-40 px-4 py-3 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,255,255,0.12) 0%, rgba(0,200,200,0.08) 100%)",
          borderBottom: "1px solid rgba(0,255,255,0.25)",
        }}
        data-ocid="puntos-security-banner"
      >
        <Shield
          className="w-5 h-5 shrink-0"
          style={{ color: "#00FFFF" }}
          aria-hidden
        />
        <p className="text-sm font-medium text-foreground leading-snug">
          Solo realiza entregas en estos puntos para contar con el respaldo de
          la{" "}
          <span style={{ color: "#00FFFF" }} className="font-bold">
            garantía de $50 MXN
          </span>{" "}
          de Tijuana Shop
        </p>
      </div>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1
              className="font-display text-2xl md:text-3xl font-bold text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Puntos de{" "}
              <span style={{ color: "#00FFFF" }}>Entrega Seguros</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {PUNTOS.length} lugares verificados en Tijuana para realizar tus
              compra-ventas con total seguridad
            </p>
          </div>
          <Badge
            className="self-start sm:self-auto shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{
              background: "rgba(0,255,255,0.12)",
              border: "1px solid rgba(0,255,255,0.3)",
              color: "#00FFFF",
            }}
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Zona Segura
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mt-4 max-w-sm" data-ocid="puntos-search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border focus:border-accent/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Map + Cards Layout ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 pb-10 flex flex-col lg:flex-row gap-6">
        {/* Map */}
        <div
          className="w-full lg:w-[55%] rounded-xl overflow-hidden shrink-0"
          style={{
            height: "480px",
            border: "1px solid rgba(0,255,255,0.2)",
            boxShadow: "0 0 24px rgba(0,255,255,0.06)",
          }}
          data-ocid="puntos-map"
        >
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Cards List */}
        <div
          className="flex-1 flex flex-col gap-3 overflow-y-auto"
          style={{ maxHeight: "480px" }}
          data-ocid="puntos-cards-list"
        >
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <MapPin className="w-8 h-8 opacity-40" />
              <p className="text-sm">No se encontraron puntos con "{search}"</p>
            </div>
          )}
          {filtered.map((punto) => (
            <PuntoCard
              key={punto.id}
              punto={punto}
              active={activeId === punto.id}
              onSelect={() => flyToPoint(punto)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Card Component ───────────────────────────────────────────────────────────
function PuntoCard({
  punto,
  active,
  onSelect,
}: {
  punto: PuntoEntrega;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      id={`card-${punto.id}`}
      onClick={onSelect}
      className="rounded-xl p-4 cursor-pointer transition-all duration-200 flex gap-4 w-full text-left"
      style={{
        background: active ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: active ? "0 0 14px rgba(0,255,255,0.08)" : "none",
      }}
      data-ocid={`puntos-card-${punto.id}`}
    >
      {/* Pin icon block */}
      <div
        className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center"
        style={{
          background: "rgba(0,255,255,0.1)",
          border: "1px solid rgba(0,255,255,0.2)",
        }}
      >
        <MapPin
          className="w-6 h-6"
          style={{ color: active ? "#00FFFF" : "#009999" }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {punto.nombre}
            </h3>
            <p
              className="text-xs font-medium mt-0.5"
              style={{ color: "#00FFFF" }}
            >
              {punto.descripcionPunto}
            </p>
          </div>
          <Badge
            className="shrink-0 text-[10px] px-2 py-0.5"
            style={{
              background: "rgba(0,255,255,0.07)",
              border: "1px solid rgba(0,255,255,0.2)",
              color: "#00cccc",
            }}
          >
            {punto.zona}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mt-1.5 truncate">
          {punto.direccion}
        </p>

        <div className="flex items-center gap-2 mt-2.5">
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5 px-3"
            style={{
              background: "rgba(0,255,255,0.15)",
              border: "1px solid rgba(0,255,255,0.35)",
              color: "#00FFFF",
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(punto.googleMapsUrl, "_blank", "noopener,noreferrer");
            }}
            data-ocid={`puntos-directions-${punto.id}`}
          >
            <Navigation className="w-3.5 h-3.5" />
            ¿Cómo llegar?
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1.5 px-3 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${punto.nombre} ${punto.direccion}`)}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver en Maps
          </Button>
        </div>
      </div>
    </button>
  );
}
