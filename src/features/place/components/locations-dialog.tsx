"use client";

import Link from "next/link";
import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import { RatingStars } from "@/components/ui/rating-stars";

export interface BranchLite {
  id: string;
  name: string;
  slug: string;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  is_main_branch: boolean;
}

function formatAddress(b: BranchLite) {
  const parts = [
    [b.address_line1, b.address_line2].filter(Boolean).join(" "),
    [b.city, b.state].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
  return parts;
}

export default function LocationsDialog({
  open,
  onOpenChange,
  placeName,
  averageRating,
  reviewCount,
  branches,
  placeSlug,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  placeName: string;
  averageRating?: number;
  reviewCount?: number;
  branches: BranchLite[];
  placeSlug?: string;
}) {
  const others = (branches || []).filter((b) => !b.is_main_branch);
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="5xl">
      <div className="p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-semibold">
            All locations · {placeName}
          </div>
          {averageRating != null && reviewCount != null ? (
            <div className="flex items-center gap-2 text-sm">
              <RatingStars rating={averageRating} size={16} />
              <span>
                {averageRating?.toFixed(1)} ({reviewCount})
              </span>
            </div>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {others.map((b) => (
            <Link
              key={b.id}
              href={placeSlug ? `/place/${placeSlug}/${b.slug}` : `#`}
              className="border-border hover:bg-muted/30 flex gap-3 border p-3"
            >
              <div className="bg-muted relative h-20 w-28 overflow-hidden">
                <Image
                  src="/window.svg"
                  alt={b.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 font-semibold">{b.name}</div>
                <div className="line-clamp-2 text-sm">{formatAddress(b)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

