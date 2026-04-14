import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  score: number;
  totalReviews?: number;
  size?: "sm" | "md";
}

export function StarRating({
  score,
  totalReviews,
  size = "md",
}: StarRatingProps) {
  const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(starSize, "shrink-0")}
            style={{
              color: star <= score ? "#00FFFF" : undefined,
              fill: star <= score ? "#00FFFF" : "transparent",
            }}
            strokeWidth={star <= score ? 0 : 1.5}
          />
        ))}
      </div>
      {totalReviews !== undefined && (
        <span className={cn(textSize, "text-muted-foreground")}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
}
