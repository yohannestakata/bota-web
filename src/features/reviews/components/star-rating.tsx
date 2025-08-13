"use client";

import { useState } from "react";
import { RatingStars } from "@/components/ui/rating-stars";

export function StarRating({
  value,
  onChange,
  className = "",
}: {
  value: number;
  onChange: (next: number) => void;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const label = ["Terrible", "Poor", "Okay", "Good", "Excellent"][
    (hover ?? value) - 1
  ];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((v) => {
          const filled = v <= (hover ?? value);
          return (
            <button
              key={v}
              type="button"
              aria-label={`${v} star`}
              onMouseEnter={() => setHover(v)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(v)}
              className="hover:bg-accent rounded p-1"
            >
              <RatingStars rating={filled ? 1 : 0} max={1} size={32} />
            </button>
          );
        })}
      </div>
      <span className="text-muted-foreground text-sm">{label}</span>
    </div>
  );
}
