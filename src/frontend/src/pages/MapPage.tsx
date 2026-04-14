import "leaflet/dist/leaflet.css";
import { ProductCategory, ProductZone } from "@/backend";
import type { Product } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-backend";
import { formatPrice, formatZone } from "@/types/marketplace";
import L from "leaflet";
import { ChevronDown, Filter, Locate, Menu, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Zone Coordinates ─────────────────────────────────────────────────────────
const ZONE_COORDS: Record<string, [number, number]> = {
  [ProductZone.playas]: [32.5308, -117.0576],
  [ProductZone.otay]: [32.535, -116.995],
  [ProductZone.centro]: [32.5321, -117.0319],
  [ProductZone.corredor2000]: [32.4868, -116.9756],
};
const TIJUANA_CENTER: [number, number] = [32.5149, -117.0382];

function getProductCoords(product: Product): [number, number] {
  const base = ZONE_COORDS[product.zone] ?? TIJUANA_CENTER;
  const seed =
    product.id.charCodeAt(0) + product.id.charCodeAt(1 % product.id.length);
  return [
    base[0] + ((seed % 100) - 50) * 0.0001,
    base[1] + (((seed * 7) % 100) - 50) * 0.0001,
  ];
}

// ─── Custom Markers ───────────────────────────────────────────────────────────
function createCyanMarker() {
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#00FFFF;border:2px solid #0099bb;transform:rotate(-45deg);box-shadow:0 0 8px #00FFFF88;"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -30],
  });
}

function createUserMarker() {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#4488ff;border:3px solid white;box-shadow:0 0 12px #4488ffaa;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// ─── Filter Options ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "", label: "Todos" },
  { value: ProductCategory.electronico, label: "Electrónicos" },
  { value: ProductCategory.ropa, label: "Ropa" },
  { value: ProductCategory.mueble, label: "Muebles" },
  { value: ProductCategory.auto, label: "Autos" },
  { value: ProductCategory.otro, label: "Otros" },
];

const ZONES = [
  { value: "", label: "Todas las zonas" },
  { value: ProductZone.playas, label: "Playas" },
  { value: ProductZone.otay, label: "Otay" },
  { value: ProductZone.centro, label: "Centro" },
  { value: ProductZone.corredor2000, label: "Corredor 2000" },
];

// ─── Dark popup CSS ───────────────────────────────────────────────────────────
const DARK_POPUP_CSS = `
.leaflet-popup-content-wrapper{background:#0d1117!important;color:#e2e8f0!important;border:1px solid #00FFFF44!important;border-radius:12px!important;box-shadow:0 0 20px #00FFFF22!important;padding:0!important;}
.leaflet-popup-content{margin:0!important;width:auto!important;}
.leaflet-popup-tip{background:#0d1117!important;}
.leaflet-popup-close-button{color:#00FFFF!important;font-size:18px!important;padding:4px 8px!important;}
.leaflet-container{background:#0d1117;}
`;

function injectDarkCSS() {
  if (document.getElementById("leaflet-dark-css")) return;
  const style = document.createElement("style");
  style.id = "leaflet-dark-css";
  style.textContent = DARK_POPUP_CSS;
  document.head.appendChild(style);
}

// ─── MapPage ──────────────────────────────────────────────────────────────────
export default function MapPage() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const lastGeocodeRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zone, setZone] = useState("");
  const [category, setCategory] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [geocodeQuery, setGeocodeQuery] = useState("");
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const { data: products = [], isLoading } = useProducts({});

  // Client-side filtering
  const filtered = products.filter((p) => {
    if (p.status !== "active") return false;
    if (zone && p.zone !== zone) return false;
    if (category && p.category !== category) return false;
    const price = Number(p.price);
    if (priceMin && price < Number(priceMin)) return false;
    if (priceMax && price > Number(priceMax)) return false;
    return true;
  });

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    injectDarkCSS();
    const map = L.map(containerRef.current, {
      center: TIJUANA_CENTER,
      zoom: 13,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    for (const product of filtered) {
      const [lat, lon] = getProductCoords(product);
      const marker = L.marker([lat, lon], { icon: createCyanMarker() });

      const thumb = product.photos[0]
        ? `<img src="${product.photos[0]}" alt="${product.title}" style="width:100%;height:96px;object-fit:cover;border-radius:10px 10px 0 0;" onerror="this.parentElement.querySelector('.fallback').style.display='flex';this.style.display='none'"/>`
        : "";
      const fallback = `<div class="fallback" style="width:100%;height:60px;${product.photos[0] ? "display:none;" : "display:flex;"}align-items:center;justify-content:center;background:#1a1a2e;border-radius:10px 10px 0 0;color:#00FFFF;font-size:28px;">&#x1F6CD;</div>`;

      marker
        .bindPopup(
          L.popup({ maxWidth: 220, minWidth: 196 }).setContent(`
          <div style="overflow:hidden;border-radius:12px;">
            ${thumb}${fallback}
            <div style="padding:10px 12px 12px;">
              <p style="margin:0 0 4px;font-weight:600;font-size:13px;color:#e2e8f0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${product.title}</p>
              <p style="margin:0 0 4px;color:#00FFFF;font-weight:700;font-size:14px;">${formatPrice(Number(product.price))}</p>
              <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;">&#x1F4CD; ${formatZone(product.zone as ProductZone)} &middot; ${product.colony || "Tijuana"}</p>
              <a href="/producto/${product.id}" style="display:block;text-align:center;background:#00FFFF;color:#000;font-weight:600;font-size:12px;padding:6px 12px;border-radius:6px;text-decoration:none;">Ver detalles &rarr;</a>
            </div>
          </div>
        `),
        )
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [filtered]);

  // Geocode search
  const handleGeocode = useCallback(async () => {
    if (!geocodeQuery.trim()) return;
    const elapsed = Date.now() - lastGeocodeRef.current;
    const delay = elapsed < 1000 ? 1000 - elapsed : 0;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsGeoLoading(true);
      lastGeocodeRef.current = Date.now();
      try {
        const q = encodeURIComponent(
          `${geocodeQuery}, Tijuana, Baja California, Mexico`,
        );
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=mx&format=json&limit=1`,
          { headers: { "Accept-Language": "es" } },
        );
        const data = (await res.json()) as Array<{ lat: string; lon: string }>;
        if (data.length > 0) {
          mapRef.current?.flyTo(
            [Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)],
            16,
            { animate: true, duration: 1.2 },
          );
        } else {
          toast.error("No se encontró esa ubicación en Tijuana.");
        }
      } catch {
        toast.error("Error al buscar la ubicación. Intenta de nuevo.");
      } finally {
        setIsGeoLoading(false);
      }
    }, delay);
  }, [geocodeQuery]);

  // Geolocate user
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        userMarkerRef.current?.remove();
        const m = L.marker([coords.latitude, coords.longitude], {
          icon: createUserMarker(),
        }).bindTooltip("Estás aquí", { permanent: false });
        m.addTo(mapRef.current!);
        userMarkerRef.current = m;
        mapRef.current?.flyTo([coords.latitude, coords.longitude], 15, {
          animate: true,
          duration: 1.2,
        });
        setIsLocating(false);
      },
      () => {
        toast.error(
          "No se pudo acceder a tu ubicación. Verifica los permisos.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const clearFilters = () => {
    setZone("");
    setCategory("");
    setPriceMin("");
    setPriceMax("");
  };
  const hasFilters = !!(zone || category || priceMin || priceMax);

  return (
    <div className="flex" style={{ height: "calc(100vh - 64px)" }}>
      {/* Sidebar */}
      <aside
        data-ocid="map-sidebar"
        className={`flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out md:relative absolute left-0 top-0 bottom-0 z-10 ${sidebarOpen ? "w-72" : "w-0"}`}
        style={{ background: "#0a0a1a", borderRight: "1px solid #00FFFF22" }}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid #00FFFF22" }}
            >
              <span
                className="font-bold text-sm flex items-center gap-2"
                style={{ color: "#00FFFF" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Mapa de Productos
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="text-muted-foreground hover:text-foreground md:hidden"
                aria-label="Cerrar filtros"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-4">
              {/* Geocode */}
              <div>
                <label
                  htmlFor="map-geocode-input"
                  className="text-xs font-medium mb-1 block"
                  style={{ color: "#00FFFF99" }}
                >
                  Buscar lugar o colonia
                </label>
                <div className="flex gap-2">
                  <Input
                    id="map-geocode-input"
                    data-ocid="map-geocode-input"
                    placeholder="Ej. Playas de Tijuana"
                    value={geocodeQuery}
                    onChange={(e) => setGeocodeQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGeocode()}
                    className="text-xs h-8"
                    style={{
                      background: "#0d1117",
                      borderColor: "#00FFFF33",
                      color: "#e2e8f0",
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleGeocode}
                    disabled={isGeoLoading || !geocodeQuery.trim()}
                    className="h-8 px-2 flex-shrink-0"
                    style={{ borderColor: "#00FFFF44", color: "#00FFFF" }}
                    aria-label="Buscar"
                    data-ocid="map-geocode-btn"
                  >
                    {isGeoLoading ? (
                      <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Zone */}
              <div>
                <label
                  htmlFor="map-zone-filter"
                  className="text-xs font-medium mb-1 block"
                  style={{ color: "#00FFFF99" }}
                >
                  Zona
                </label>
                <div className="relative">
                  <select
                    id="map-zone-filter"
                    data-ocid="map-zone-filter"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full text-xs h-8 rounded-md px-3 pr-8 appearance-none"
                    style={{
                      background: "#0d1117",
                      border: "1px solid #00FFFF33",
                      color: "#e2e8f0",
                    }}
                  >
                    {ZONES.map((z) => (
                      <option
                        key={z.value}
                        value={z.value}
                        style={{ background: "#0d1117" }}
                      >
                        {z.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                    style={{ color: "#00FFFF66" }}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="map-category-filter"
                  className="text-xs font-medium mb-1 block"
                  style={{ color: "#00FFFF99" }}
                >
                  Categoría
                </label>
                <div className="relative">
                  <select
                    id="map-category-filter"
                    data-ocid="map-category-filter"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs h-8 rounded-md px-3 pr-8 appearance-none"
                    style={{
                      background: "#0d1117",
                      border: "1px solid #00FFFF33",
                      color: "#e2e8f0",
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option
                        key={c.value}
                        value={c.value}
                        style={{ background: "#0d1117" }}
                      >
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                    style={{ color: "#00FFFF66" }}
                  />
                </div>
              </div>

              {/* Price range */}
              <div>
                <label
                  htmlFor="map-price-min"
                  className="text-xs font-medium mb-1 block"
                  style={{ color: "#00FFFF99" }}
                >
                  Precio (MXN)
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="map-price-min"
                    data-ocid="map-price-min"
                    type="number"
                    placeholder="Mín"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="text-xs h-8"
                    style={{
                      background: "#0d1117",
                      borderColor: "#00FFFF33",
                      color: "#e2e8f0",
                    }}
                  />
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: "#00FFFF44" }}
                  >
                    –
                  </span>
                  <Input
                    id="map-price-max"
                    data-ocid="map-price-max"
                    type="number"
                    placeholder="Máx"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="text-xs h-8"
                    style={{
                      background: "#0d1117",
                      borderColor: "#00FFFF33",
                      color: "#e2e8f0",
                    }}
                  />
                </div>
              </div>

              {/* Clear */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  data-ocid="map-clear-filters"
                  className="w-full text-xs py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors"
                  style={{
                    background: "#00FFFF11",
                    color: "#00FFFF",
                    border: "1px solid #00FFFF33",
                  }}
                >
                  <X className="w-3 h-3" /> Limpiar filtros
                </button>
              )}

              {/* Status panel */}
              <div
                className="rounded-lg p-3"
                style={{
                  background: "#00FFFF0A",
                  border: "1px solid #00FFFF22",
                }}
              >
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div data-ocid="map-empty-state" className="text-center">
                    <p className="text-xs text-muted-foreground">
                      No hay productos en esta zona.
                    </p>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs mt-1"
                        style={{ color: "#00FFFF" }}
                      >
                        Quitar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: "#00FFFF" }}
                    >
                      {filtered.length} productos
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.values(ProductZone).map((z) => {
                        const count = filtered.filter(
                          (p) => p.zone === z,
                        ).length;
                        if (!count) return null;
                        return (
                          <Badge
                            key={z}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 cursor-pointer"
                            style={{
                              borderColor: "#00FFFF44",
                              color: "#00FFFF99",
                            }}
                            onClick={() => setZone(z)}
                          >
                            {formatZone(z as ProductZone)} ({count})
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Map area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Toggle btn */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-ocid="map-sidebar-toggle"
          className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-all"
          style={{
            background: "#0a0a1aee",
            border: "1px solid #00FFFF44",
            color: "#00FFFF",
            backdropFilter: "blur(8px)",
          }}
          aria-label={sidebarOpen ? "Ocultar filtros" : "Mostrar filtros"}
        >
          {sidebarOpen ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Filter className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {sidebarOpen ? "Ocultar" : "Filtros"}
          </span>
        </button>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="absolute top-3 left-28 z-[1000] flex gap-1.5 flex-wrap max-w-xs">
            {zone && (
              <span
                className="text-[10px] px-2 py-1 rounded-full flex items-center gap-1"
                style={{
                  background: "#00FFFF22",
                  border: "1px solid #00FFFF55",
                  color: "#00FFFF",
                }}
              >
                {ZONES.find((z2) => z2.value === zone)?.label}
                <button
                  type="button"
                  onClick={() => setZone("")}
                  aria-label="Quitar zona"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {category && (
              <span
                className="text-[10px] px-2 py-1 rounded-full flex items-center gap-1"
                style={{
                  background: "#00FFFF22",
                  border: "1px solid #00FFFF55",
                  color: "#00FFFF",
                }}
              >
                {CATEGORIES.find((c) => c.value === category)?.label}
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  aria-label="Quitar categoría"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Locate me btn */}
        <button
          type="button"
          onClick={handleLocate}
          disabled={isLocating}
          data-ocid="map-locate-btn"
          className="absolute bottom-6 right-4 z-[1000] w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all"
          style={{
            background: "#00FFFF",
            color: "#000",
            boxShadow: "0 0 20px #00FFFF66",
          }}
          aria-label="Mi ubicación"
        >
          {isLocating ? (
            <div className="w-5 h-5 rounded-full border-2 border-black/40 border-t-black animate-spin" />
          ) : (
            <Locate className="w-5 h-5" />
          )}
        </button>

        {/* Mobile sidebar button */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden absolute bottom-20 right-4 z-[1000] w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
            style={{
              background: "#0a0a1aee",
              border: "1px solid #00FFFF44",
              color: "#00FFFF",
            }}
            aria-label="Abrir filtros"
            data-ocid="map-mobile-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 z-[900] flex items-center justify-center"
            style={{ background: "#0a0a1a88", backdropFilter: "blur(4px)" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#00FFFF44", borderTopColor: "#00FFFF" }}
              />
              <p className="text-xs" style={{ color: "#00FFFF" }}>
                Cargando productos…
              </p>
            </div>
          </div>
        )}

        {/* Leaflet container */}
        <div
          ref={containerRef}
          className="w-full h-full"
          data-ocid="map-container"
        />
      </div>
    </div>
  );
}
