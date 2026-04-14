import { ProductCard } from "@/components/ui/ProductCard";
import { SellerBadgeComponent } from "@/components/ui/SellerBadge";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateConversation,
  useCurrentUser,
  useProductsByVendor,
  useVendorProfile,
} from "@/hooks/use-backend";
import { ProductStatus } from "@/types/marketplace";
import { getBadge } from "@/types/marketplace";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Lock,
  MapPin,
  MessageCircle,
  Package,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FilterTab = "active" | "paused" | "all";

function formatMemberSince(ts: bigint): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function VendorProfilePage() {
  const { id } = useParams({ from: "/vendedor/$id" });
  const [activeTab, setActiveTab] = useState<FilterTab>("active");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useCurrentUser();
  const createConversation = useCreateConversation();

  const { data: vendor, isLoading: vendorLoading } = useVendorProfile(id);
  const { data: products = [], isLoading: productsLoading } =
    useProductsByVendor(id);

  const filteredProducts = products.filter((p) => {
    if (activeTab === "active") return p.status === ProductStatus.active;
    if (activeTab === "paused") return p.status === ProductStatus.paused;
    return true;
  });

  const isOwnProfile = !!user && user.id === id;

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.error("Inicia sesión para enviar un mensaje.");
      return;
    }
    if (!vendor) return;
    // Use a dummy productId since this is a generic contact from profile
    createConversation.mutate(
      { sellerId: vendor.id, productId: "general" },
      {
        onSuccess: (conv) => {
          void navigate({
            to: "/chat/$conversationId",
            params: { conversationId: conv.id },
          });
        },
        onError: () => void navigate({ to: "/chat" }),
      },
    );
  };

  if (vendorLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="rounded-2xl bg-card border-cyan-subtle p-6 flex gap-6">
          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["c1", "c2", "c3", "c4"] as const).map((k) => (
            <Skeleton key={k} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Vendedor no encontrado</p>
      </div>
    );
  }

  const badge = getBadge(vendor);
  const memberSince = formatMemberSince(vendor.createdAt);

  const STAT_CARDS = [
    {
      label: "Calificación",
      value: vendor.avgRating.toFixed(1),
      icon: <Star className="w-4 h-4" />,
    },
    {
      label: "Ventas completadas",
      value: String(vendor.totalSales),
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      label: "Reseñas",
      value: String(products.length),
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "Zona",
      value: vendor.zone ?? "Tijuana",
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="max-w-5xl mx-auto px-4 py-8 space-y-6"
      data-ocid="vendor-profile"
    >
      {/* Vendor Header */}
      <section
        className="rounded-2xl bg-card p-6 flex flex-col sm:flex-row gap-6"
        style={{ border: "1px solid rgba(0,255,255,0.12)" }}
      >
        <Avatar
          className="w-24 h-24 shrink-0 ring-2 ring-offset-2 ring-offset-background"
          style={{ boxShadow: "0 0 16px rgba(0,255,255,0.2)" }}
        >
          {vendor.avatarUrl && (
            <AvatarImage src={vendor.avatarUrl} alt={vendor.name} />
          )}
          <AvatarFallback
            className="text-2xl font-display font-bold"
            style={{ background: "rgba(0,255,255,0.1)", color: "#00FFFF" }}
          >
            {getInitials(vendor.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-foreground truncate">
              {vendor.name}
            </h1>
            <SellerBadgeComponent badge={badge} />
          </div>

          {vendor.zone && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{vendor.zone}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <StarRating
              score={Math.round(vendor.avgRating)}
              totalReviews={Number(vendor.totalSales)}
            />
            <span className="text-sm text-muted-foreground">
              <span style={{ color: "#00FFFF" }} className="font-semibold">
                {String(vendor.totalSales)}
              </span>{" "}
              ventas completadas
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Miembro desde {memberSince}
          </p>

          {vendor.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {vendor.bio}
            </p>
          )}
        </div>

        <div className="sm:self-start">
          {!isOwnProfile && (
            <Button
              variant="outline"
              className="gap-2 transition-smooth"
              style={{ borderColor: "rgba(0,255,255,0.3)", color: "#00FFFF" }}
              onClick={handleContact}
              disabled={createConversation.isPending}
              data-ocid="vendor-contact-btn"
            >
              <MessageCircle className="w-4 h-4" />
              {createConversation.isPending ? "Abriendo…" : "Enviar mensaje"}
            </Button>
          )}
        </div>
      </section>

      {/* Stats Row */}
      <section
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        data-ocid="vendor-stats"
      >
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-card p-4 flex flex-col gap-1"
            style={{ border: "1px solid rgba(0,255,255,0.1)" }}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <span style={{ color: "#00FFFF" }}>{stat.icon}</span>
              {stat.label}
            </div>
            <span
              className="font-display text-xl font-bold"
              style={{ color: "#00FFFF" }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </section>

      {/* Products Grid */}
      <section data-ocid="vendor-products">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" style={{ color: "#00FFFF" }} />
            Publicaciones
          </h2>
          {/* Filter tabs */}
          <div
            className="flex rounded-lg overflow-hidden text-sm"
            style={{ border: "1px solid rgba(0,255,255,0.15)" }}
          >
            {(["active", "paused", "all"] as FilterTab[]).map((tab) => {
              const labels: Record<FilterTab, string> = {
                active: "Activos",
                paused: "Pausados",
                all: "Todos",
              };
              return (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 transition-smooth"
                  style={{
                    background:
                      activeTab === tab
                        ? "rgba(0,255,255,0.15)"
                        : "transparent",
                    color: activeTab === tab ? "#00FFFF" : undefined,
                  }}
                  data-ocid={`vendor-tab-${tab}`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((k) => (
              <Skeleton key={k} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="rounded-xl bg-card p-12 flex flex-col items-center gap-4"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            data-ocid="vendor-empty-state"
          >
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Este vendedor no tiene productos activos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} seller={vendor} />
                {product.isApartado && (
                  <span
                    className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: "rgba(255,165,0,0.2)",
                      border: "1px solid rgba(255,165,0,0.5)",
                      color: "#FFA500",
                      backdropFilter: "blur(4px)",
                    }}
                    data-ocid="vendor-product-apartado-badge"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    Apartado
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
