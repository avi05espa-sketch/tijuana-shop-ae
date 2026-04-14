import { ReportType } from "@/backend";
import { SellerBadgeComponent } from "@/components/ui/SellerBadge";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useActorRef,
  useCreateCheckoutSession,
  useCreateConversation,
  useCreateOrder,
  useCurrentUser,
  useProduct,
  useSaveProduct,
  useSavedProducts,
  useUnsaveProduct,
  useVendorProfile,
} from "@/hooks/use-backend";
import {
  ProductStatus,
  formatCategory,
  formatCondition,
  formatPrice,
  formatZone,
  getBadge,
} from "@/types/marketplace";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Flag,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const PLACEHOLDER = "/assets/images/placeholder.svg";

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-[60%] space-y-3">
          <Skeleton className="w-full aspect-[4/3] rounded-xl" />
          <div className="flex gap-2">
            {["t0", "t1", "t2", "t3", "t4"].map((tk) => (
              <Skeleton
                key={tk}
                className="w-16 h-16 rounded-md flex-shrink-0"
              />
            ))}
          </div>
        </div>
        <div className="lg:w-[40%] space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Photo Carousel ───────────────────────────────────────────────────────────
function PhotoCarousel({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);
  const allPhotos = photos.length > 0 ? photos : [PLACEHOLDER];
  const total = allPhotos.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-card border-cyan-subtle"
        data-ocid="product-photo-main"
      >
        <img
          src={allPhotos[current]}
          alt={`Foto ${current + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
          }}
        />

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-smooth"
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(0,255,255,0.3)",
              }}
              data-ocid="photo-prev"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: "#00FFFF" }} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-smooth"
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(0,255,255,0.3)",
              }}
              data-ocid="photo-next"
            >
              <ChevronRight className="w-5 h-5" style={{ color: "#00FFFF" }} />
            </button>
          </>
        )}

        {/* Counter */}
        {total > 1 && (
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(0,0,0,0.65)",
              color: "#00FFFF",
              border: "1px solid rgba(0,255,255,0.25)",
            }}
          >
            {current + 1} / {total}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
          data-ocid="photo-thumbnails"
        >
          {allPhotos.map((src, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: photo order is stable
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-smooth"
              style={{
                border:
                  i === current
                    ? "2px solid rgba(0,255,255,0.8)"
                    : "2px solid rgba(255,255,255,0.1)",
                boxShadow:
                  i === current ? "0 0 8px rgba(0,255,255,0.4)" : "none",
              }}
              aria-label={`Ver foto ${i + 1}`}
            >
              <img
                src={src}
                alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
const REPORT_REASONS = [
  "Producto falso",
  "Precio engañoso",
  "Foto incorrecta",
  "Vendedor sospechoso",
  "Otro",
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

function ReportModal({ open, onClose, productId }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const { actor } = useActorRef();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No autenticado");
      return actor.createReport(ReportType.product, productId, reason, comment);
    },
    onSuccess: () => {
      toast.success("Reporte enviado. Gracias por ayudarnos.");
      setReason("");
      setComment("");
      onClose();
    },
    onError: () =>
      toast.error("Error al enviar el reporte. Inténtalo de nuevo."),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(0.13 0 0)",
          border: "1px solid rgba(0,255,255,0.2)",
        }}
        data-ocid="report-modal"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Reportar producto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label
              htmlFor="report-reason"
              className="text-sm text-muted-foreground"
            >
              Motivo del reporte
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger
                id="report-reason"
                className="bg-secondary border-input"
                data-ocid="report-reason-select"
              >
                <SelectValue placeholder="Selecciona un motivo…" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "oklch(0.18 0 0)",
                  border: "1px solid rgba(0,255,255,0.15)",
                }}
              >
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="report-comment"
              className="text-sm text-muted-foreground"
            >
              Comentario adicional{" "}
              <span className="text-xs opacity-60">(opcional · máx 500)</span>
            </label>
            <Textarea
              id="report-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Describe el problema con más detalle…"
              className="bg-secondary border-input resize-none h-24"
              data-ocid="report-comment"
            />
            <p className="text-xs text-right text-muted-foreground">
              {comment.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-ocid="report-cancel">
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!reason || mutation.isPending}
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#f87171",
            }}
            data-ocid="report-submit"
          >
            {mutation.isPending ? "Enviando…" : "Enviar reporte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Relative date ────────────────────────────────────────────────────────────
function relativeDate(ts: bigint): string {
  const msAgo = Date.now() - Number(ts / 1_000_000n);
  const days = Math.floor(msAgo / 86_400_000);
  if (days === 0) return "hoy";
  if (days === 1) return "hace 1 día";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months === 1) return "hace 1 mes";
  return `hace ${months} meses`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ProductDetailPage() {
  const { id } = useParams({ from: "/producto/$id" });
  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: seller, isLoading: sellerLoading } = useVendorProfile(
    product?.sellerId ?? "",
  );
  const { data: savedProducts } = useSavedProducts();
  const { isAuthenticated, user, isAdmin } = useCurrentUser();
  const saveProduct = useSaveProduct();
  const unsaveProduct = useUnsaveProduct();
  const { actor } = useActorRef();
  const createCheckoutSession = useCreateCheckoutSession();
  const createOrder = useCreateOrder();
  const createConversation = useCreateConversation();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Increment views once
  const viewsIncremented = useRef(false);
  useEffect(() => {
    if (actor && product?.id && !viewsIncremented.current) {
      viewsIncremented.current = true;
      actor.incrementProductViews(product.id).catch(() => null);
    }
  }, [actor, product?.id]);

  const isSaved = useMemo(
    () => savedProducts?.some((s) => s.productId === id) ?? false,
    [savedProducts, id],
  );

  const isOwnProduct = !!user && !!product && user.id === product.sellerId;
  const canBuy =
    isAuthenticated &&
    !isOwnProduct &&
    !isAdmin &&
    product?.status === ProductStatus.active;

  const handleBuyNow = () => {
    if (!product) return;
    const cancelUrl = `${window.location.origin}/producto/${product.id}`;
    // Create order first with placeholder intent so we have an orderId for successUrl
    createOrder.mutate(
      {
        productId: product.id,
        sellerId: product.sellerId,
        amountMxn: BigInt(Math.round(Number(product.price))),
        stripePaymentIntentId: "pending",
      },
      {
        onSuccess: (order) => {
          const successUrl = `${window.location.origin}/orden/${order.id}?success=true`;
          createCheckoutSession.mutate(
            { productId: product.id, successUrl, cancelUrl },
            {
              onSuccess: ({ checkoutUrl }) => {
                window.open(checkoutUrl, "_blank", "noopener,noreferrer");
              },
              onError: () => {
                toast.error("Error al procesar el pago. Intenta de nuevo.");
              },
            },
          );
        },
        onError: () => {
          toast.error("Error al crear la orden. Intenta de nuevo.");
        },
      },
    );
  };

  const handleChatSeller = () => {
    if (!isAuthenticated) {
      toast.error("Inicia sesión para chatear con el vendedor.");
      return;
    }
    if (!product) return;
    createConversation.mutate(
      { sellerId: product.sellerId, productId: product.id },
      {
        onSuccess: (conv) => {
          void navigate({
            to: "/chat/$conversationId",
            params: { conversationId: conv.id },
          });
        },
        onError: () => toast.error("Error al iniciar conversación."),
      },
    );
  };

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      toast.error("Inicia sesión para guardar productos.");
      return;
    }
    if (isSaved) {
      unsaveProduct.mutate(id, {
        onError: () => toast.error("Error al quitar de favoritos."),
      });
    } else {
      saveProduct.mutate(id, {
        onError: () => toast.error("Error al guardar producto."),
      });
    }
  };

  const isLoading = productLoading || sellerLoading;

  if (isLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">
          Producto no encontrado
        </h2>
        <p className="text-muted-foreground text-sm">
          El producto que buscas ya no está disponible.
        </p>
        <Link to="/" className="text-sm" style={{ color: "#00FFFF" }}>
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  const descTooLong = product.description.length > 300;
  const displayDesc =
    descTooLong && !expanded
      ? `${product.description.slice(0, 300)}…`
      : product.description;

  const sellerInitials = seller?.name
    ? seller.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-6 lg:py-10"
      data-ocid="product-detail-page"
    >
      {/* Breadcrumb */}
      <nav className="mb-5 text-xs text-muted-foreground flex items-center gap-1.5">
        <Link to="/" className="hover:text-foreground transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* ── Left: Photo Carousel ──────────────────────────── */}
        <div className="lg:w-[60%]">
          <PhotoCarousel photos={product.photos} />
        </div>

        {/* ── Right: Info Panel ─────────────────────────────── */}
        <div className="lg:w-[40%] flex flex-col gap-5">
          {/* Price + Negotiable */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span
              className="font-display font-bold text-4xl leading-none tracking-tight"
              style={{ color: "#00FFFF" }}
              data-ocid="product-price"
            >
              {formatPrice(product.price)}
            </span>
            {product.negotiable && (
              <Badge
                className="text-xs font-medium px-2.5"
                style={{
                  background: "rgba(0,255,255,0.1)",
                  border: "1px solid rgba(0,255,255,0.3)",
                  color: "#00FFFF",
                }}
              >
                Negociable
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-2xl text-foreground leading-snug">
            {product.title}
          </h1>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2" data-ocid="product-badges">
            <Badge
              variant={product.condition === "nuevo" ? "default" : "secondary"}
              className="text-xs"
            >
              {formatCondition(product.condition)}
            </Badge>
            <Badge variant="outline" className="text-xs border-border">
              {formatCategory(product.category)}
            </Badge>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(0,255,255,0.07)",
                border: "1px solid rgba(0,255,255,0.2)",
                color: "#00FFFF",
              }}
            >
              <MapPin className="w-3 h-3" />
              {formatZone(product.zone)}
            </span>
            {product.isApartado && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(255,165,0,0.15)",
                  border: "1px solid rgba(255,165,0,0.4)",
                  color: "#FFA500",
                }}
                data-ocid="apartado-badge"
              >
                🔒 Apartado
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {displayDesc}
            </p>
            {descTooLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-xs font-medium transition-colors"
                style={{ color: "#00FFFF" }}
                data-ocid="product-expand-desc"
              >
                {expanded ? "Ver menos ↑" : "Ver más ↓"}
              </button>
            )}
          </div>

          {/* Meta: date + views */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Publicado {relativeDate(product.createdAt)}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {Number(product.views).toLocaleString("es-MX")} personas han visto
              esto
            </span>
          </div>

          {/* Colony */}
          {product.colony && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{product.colony}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5" data-ocid="product-actions">
            {/* Buy Now button — only when authenticated, not own product, and active */}
            {canBuy && (
              <Button
                className="w-full h-12 text-base font-bold transition-smooth"
                style={{
                  background: "rgba(0,255,255,0.9)",
                  border: "1px solid rgba(0,255,255,1)",
                  color: "#000",
                  boxShadow: "0 0 16px rgba(0,255,255,0.35)",
                }}
                onClick={handleBuyNow}
                disabled={
                  createOrder.isPending || createCheckoutSession.isPending
                }
                data-ocid="buy-now-btn"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {createOrder.isPending || createCheckoutSession.isPending
                  ? "Procesando…"
                  : "Comprar ahora"}
              </Button>
            )}

            {/* Chat button — only for buyers (not own product, not admin) */}
            {!isOwnProduct && (
              <Button
                className="w-full h-12 text-base font-semibold transition-smooth"
                style={{
                  background: "rgba(0,255,255,0.15)",
                  border: "1px solid rgba(0,255,255,0.5)",
                  color: "#00FFFF",
                }}
                onClick={handleChatSeller}
                disabled={createConversation.isPending}
                data-ocid="contact-seller-btn"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {createConversation.isPending
                  ? "Abriendo chat…"
                  : "Chatear con vendedor"}
              </Button>
            )}

            {/* WhatsApp button — shown when vendor has set a WhatsApp number */}
            {product.whatsappContact && !isOwnProduct && (
              <a
                href={`https://wa.me/${product.whatsappContact.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2 rounded-md transition-smooth"
                style={{
                  background: "rgba(37,211,102,0.15)",
                  border: "1px solid rgba(37,211,102,0.5)",
                  color: "#25D366",
                }}
                data-ocid="whatsapp-contact-btn"
                aria-label="Contactar por WhatsApp"
              >
                <Phone className="w-4 h-4" />
                Contactar por WhatsApp
              </a>
            )}

            <Button
              variant="outline"
              className="w-full h-11 transition-smooth"
              style={
                isSaved
                  ? {
                      border: "1px solid rgba(0,255,255,0.5)",
                      color: "#00FFFF",
                    }
                  : {}
              }
              onClick={handleToggleSave}
              disabled={saveProduct.isPending || unsaveProduct.isPending}
              data-ocid="save-product-btn"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck
                    className="w-4 h-4 mr-2"
                    style={{ color: "#00FFFF" }}
                  />
                  Guardado ✓
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive self-start text-xs"
              onClick={() => setReportOpen(true)}
              data-ocid="report-product-btn"
            >
              <Flag className="w-3.5 h-3.5 mr-1.5" />
              Reportar este producto
            </Button>
          </div>

          {/* ── Seller Card ─────────────────────────────────── */}
          {seller && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "rgba(0,255,255,0.04)",
                border: "1px solid rgba(0,255,255,0.15)",
              }}
              data-ocid="seller-card"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Publicado por
              </p>
              <div className="flex items-start gap-3">
                <Link to="/vendedor/$id" params={{ id: seller.id }}>
                  <Avatar
                    className="w-12 h-12"
                    style={{
                      outline: "2px solid rgba(0,255,255,0.35)",
                      outlineOffset: "2px",
                    }}
                  >
                    {seller.avatarUrl && (
                      <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                    )}
                    <AvatarFallback
                      className="text-sm font-semibold"
                      style={{
                        background: "rgba(0,255,255,0.1)",
                        color: "#00FFFF",
                      }}
                    >
                      {sellerInitials}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    to="/vendedor/$id"
                    params={{ id: seller.id }}
                    className="font-semibold text-foreground hover:underline truncate block"
                    style={{ textDecorationColor: "#00FFFF" }}
                    data-ocid="seller-name-link"
                  >
                    {seller.name}
                  </Link>
                  {seller.zone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {seller.zone}
                    </div>
                  )}
                  <SellerBadgeComponent badge={getBadge(seller)} />
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm flex-wrap">
                <StarRating
                  score={Math.round(seller.avgRating)}
                  totalReviews={undefined}
                  size="md"
                />
                <span className="text-muted-foreground text-xs">
                  {Number(seller.totalSales).toLocaleString("es-MX")} ventas
                  completadas
                </span>
              </div>

              <Link
                to="/vendedor/$id"
                params={{ id: seller.id }}
                className="block text-xs text-center py-2 rounded-lg transition-smooth"
                style={{
                  background: "rgba(0,255,255,0.07)",
                  border: "1px solid rgba(0,255,255,0.2)",
                  color: "#00FFFF",
                }}
                data-ocid="view-seller-profile"
              >
                Ver perfil del vendedor →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Safety Banner ──────────────────────────────────────────── */}
      <div
        className="mt-10 rounded-xl p-4 flex items-start gap-3"
        style={{
          background: "rgba(234,179,8,0.06)",
          border: "1px solid rgba(234,179,8,0.25)",
        }}
        data-ocid="safety-banner"
        role="alert"
      >
        <AlertTriangle
          className="w-5 h-5 mt-0.5 shrink-0"
          style={{ color: "#eab308" }}
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            Consejo de seguridad:{" "}
          </span>
          Nunca compartas información bancaria por chat. Usa siempre lugares
          públicos para el intercambio.
        </p>
      </div>

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        productId={id}
      />
    </div>
  );
}
