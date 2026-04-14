import { cn } from "@/lib/utils";
import type { SellerBadge } from "@/types/marketplace";
import { CheckCircle, Star, UserCircle } from "lucide-react";

interface SellerBadgeProps {
  badge: SellerBadge;
  className?: string;
}

export function SellerBadgeComponent({ badge, className }: SellerBadgeProps) {
  if (badge === "Verificado") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
          className,
        )}
        style={{
          background: "rgba(0,255,255,0.1)",
          border: "1px solid rgba(0,255,255,0.3)",
          color: "#00FFFF",
        }}
      >
        <CheckCircle className="w-3 h-3" />
        Verificado
      </span>
    );
  }

  if (badge === "Top Vendedor") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
          className,
        )}
        style={{
          background: "rgba(255, 200, 0, 0.1)",
          border: "1px solid rgba(255, 200, 0, 0.3)",
          color: "#FFC800",
        }}
      >
        <Star className="w-3 h-3" />
        Top Vendedor
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground",
        className,
      )}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <UserCircle className="w-3 h-3" />
      Usuario Nuevo
    </span>
  );
}
