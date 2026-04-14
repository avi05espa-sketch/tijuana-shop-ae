import type { Product } from "@/backend";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentUser,
  useProduct,
  useSavedProducts,
  useUnsaveProduct,
} from "@/hooks/use-backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

// ─── Single saved product item ────────────────────────────────────────────────
function SavedProductItem({ productId }: { productId: string }) {
  const { data: product, isLoading } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="rounded-xl overflow-hidden border border-border bg-card">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <div className="p-3 flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return <ProductCard product={product as Product} />;
}

// ─── FavoritesPage ────────────────────────────────────────────────────────────
export default function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();
  const { isInitializing } = useInternetIdentity();
  const { data: savedItems = [], isLoading } = useSavedProducts();
  const unsave = useUnsaveProduct();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  async function handleUnsave(productId: string) {
    try {
      await unsave.mutateAsync(productId);
      toast.success("Producto eliminado de favoritos.");
    } catch {
      toast.error("No se pudo eliminar. Intenta de nuevo.");
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div
      className="min-h-[calc(100vh-4rem)]"
      style={{ background: "rgba(0,255,255,0.01)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2" data-ocid="favorites-header">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(0,255,255,0.1)",
                border: "1px solid rgba(0,255,255,0.3)",
              }}
            >
              <Heart className="w-5 h-5" style={{ color: "#00FFFF" }} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                Mis Favoritos
              </h1>
              {!isLoading && savedItems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {savedItems.length}{" "}
                  {savedItems.length === 1
                    ? "producto guardado"
                    : "productos guardados"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }, (_, i) => `sk-${i}`).map((id) => (
              <div
                key={id}
                className="rounded-xl overflow-hidden border border-border bg-card"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-3 flex flex-col gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && savedItems.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-24 gap-6 rounded-2xl border"
            style={{
              borderColor: "rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
            data-ocid="favorites-empty-state"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,255,255,0.07)",
                border: "1.5px solid rgba(0,255,255,0.2)",
              }}
            >
              <ShoppingBag
                className="w-10 h-10"
                style={{ color: "rgba(0,255,255,0.5)" }}
              />
            </div>
            <div className="flex flex-col items-center gap-2 text-center max-w-sm">
              <h2 className="font-display font-bold text-xl text-foreground">
                Aún no tienes productos guardados
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empieza a explorar el marketplace y guarda los productos que te
                interesen para encontrarlos fácilmente.
              </p>
            </div>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="gap-2 font-semibold px-6"
              style={{ background: "#00FFFF", color: "#0a0a0a" }}
              data-ocid="favorites-explore-btn"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar Productos
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && savedItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {savedItems.map((saved) => (
              <div key={saved.productId} className="relative group/saved">
                <SavedProductItem productId={saved.productId} />
                {/* Remove button overlay */}
                <button
                  type="button"
                  onClick={() => handleUnsave(saved.productId)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/saved:opacity-100 transition-smooth z-10"
                  style={{
                    background: "rgba(0,0,0,0.7)",
                    border: "1px solid rgba(255,100,100,0.4)",
                  }}
                  aria-label="Eliminar de favoritos"
                  data-ocid="unsave-product-btn"
                >
                  <Heart
                    className="w-4 h-4"
                    style={{ color: "#ff6464" }}
                    fill="#ff6464"
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Explore more CTA */}
        {!isLoading && savedItems.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/" })}
              className="gap-2"
              data-ocid="favorites-explore-more-btn"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar más productos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
