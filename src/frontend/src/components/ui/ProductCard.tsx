import type { Product, UserProfile } from "@/backend";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCondition, formatPrice, formatZone } from "@/types/marketplace";
import { Link } from "@tanstack/react-router";
import { MapPin, Zap } from "lucide-react";

interface ProductCardProps {
  product: Product;
  seller?: UserProfile | null;
  className?: string;
}

const PLACEHOLDER = "/assets/images/placeholder.svg";

export function ProductCard({ product, seller, className }: ProductCardProps) {
  const photo = product.photos[0] ?? PLACEHOLDER;
  const sellerInitials = seller?.name
    ? seller.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden bg-card transition-all duration-300 cursor-pointer",
        "border-cyan-subtle glow-cyan-hover",
        product.featured && "animate-glow-pulse",
        className,
      )}
      data-ocid="product-card"
    >
      {/* Image */}
      <Link
        to="/producto/$id"
        params={{ id: product.id }}
        className="block relative aspect-[4/3] overflow-hidden"
      >
        <img
          src={photo}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
          }}
        />
        {/* Featured badge */}
        {product.featured && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(0,255,255,0.2)",
              border: "1px solid rgba(0,255,255,0.4)",
              color: "#00FFFF",
            }}
          >
            <Zap className="w-3 h-3" />
            Destacado
          </div>
        )}
        {/* Condition badge */}
        <div className="absolute bottom-2 right-2">
          <Badge
            variant={product.condition === "nuevo" ? "default" : "secondary"}
            className="text-xs"
          >
            {formatCondition(product.condition)}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {/* Price */}
        <div className="flex items-center justify-between">
          <span
            className="font-display font-bold text-base"
            style={{ color: "#00FFFF" }}
          >
            {formatPrice(product.price)}
          </span>
          {product.negotiable && (
            <span className="text-xs text-muted-foreground italic">
              Negociable
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          to="/producto/$id"
          params={{ id: product.id }}
          className="text-sm font-medium text-foreground line-clamp-2 leading-snug hover:text-accent transition-colors min-w-0"
          data-ocid="product-card-title"
        >
          {product.title}
        </Link>

        {/* Zone */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{formatZone(product.zone)}</span>
        </div>

        {/* Seller */}
        {seller && (
          <Link
            to="/vendedor/$id"
            params={{ id: seller.id }}
            className="flex items-center gap-2 mt-auto pt-2 border-t group/seller"
            style={{ borderTopColor: "rgba(255,255,255,0.07)" }}
            data-ocid="product-card-seller"
          >
            <Avatar className="w-6 h-6 shrink-0">
              {seller.avatarUrl && (
                <AvatarImage src={seller.avatarUrl} alt={seller.name} />
              )}
              <AvatarFallback
                className="text-[10px]"
                style={{ background: "rgba(0,255,255,0.1)", color: "#00FFFF" }}
              >
                {sellerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground truncate group-hover/seller:text-foreground transition-colors">
                {seller.name}
              </span>
              <StarRating score={Math.round(seller.avgRating)} size="sm" />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
