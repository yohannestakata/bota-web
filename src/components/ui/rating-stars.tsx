import { StarIcon } from "lucide-react";
import React from "react";

type RatingStarsProps = {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
};

export function RatingStars({
  rating,
  max = 5,
  size = 20,
  className = "",
}: RatingStarsProps) {
  const clampedRating = Math.max(0, Math.min(rating ?? 0, max));
  const rounded = Math.round(clampedRating);

  return (
    <div
      className={`relative inline-block align-middle ${className}`}
      role="img"
      aria-label={`Rating: ${rounded} out of ${max}`}
    >
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, index) => {
          const isFilled = index < rounded;
          return (
            <StarIcon
              key={index}
              size={size}
              className={`text-secondary ${!isFilled ? "fill-secondary/5 opacity-40" : "fill-secondary opacity-100"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
