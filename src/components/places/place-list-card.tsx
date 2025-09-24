"use client";

import Link from "next/link";
import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import { RatingStars } from "@/components/ui/rating-stars";

export interface PlaceListCardProps {
  href: string;
  imageUrl?: string | null;
  title: string;
  secondaryTitle?: string;
  category?: string | null;
  locationText?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  statusText?: string | null;
  statusTone?: "success" | "danger" | "muted";
  action?: React.ReactNode;
  className?: string;
}

export default function PlaceListCard({
  href,
  imageUrl,
  title,
  secondaryTitle,
  category,
  locationText,
  rating,
  reviewCount,
  statusText,
  statusTone = "muted",
  action,
  className = "",
}: PlaceListCardProps) {
  const statusClassName =
    statusTone === "success"
      ? "text-green-700"
      : statusTone === "danger"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div
      className={`border-border flex flex-col justify-between gap-3 border p-6 ${className}`}
    >
      <div>
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={normalizeImageSrc(imageUrl)}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="mt-3 flex-1">
          <div className="flex flex-col gap-1">
            <Link
              href={href}
              className="text-foreground font-bold underline-offset-4 hover:underline"
            >
              {title}
              {secondaryTitle && secondaryTitle !== title
                ? ` (${secondaryTitle})`
                : ""}
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {category ? <div className="text-sm">{category}</div> : null}
              {category && (statusText || locationText) ? <span>•</span> : null}
              {statusText ? (
                <span className={`${statusClassName} text-sm font-semibold`}>
                  {statusText}
                </span>
              ) : locationText ? (
                <span className="text-muted-foreground text-sm">
                  {locationText}
                </span>
              ) : null}
            </div>
          </div>

          {typeof rating === "number" ? (
            <div className="mt-1 flex items-center gap-2">
              <RatingStars rating={rating || 0} size={16} />
              <span className="text-sm font-medium">
                {(rating || 0).toFixed(1)}
              </span>
              {typeof reviewCount === "number" ? (
                <span className="text-muted-foreground text-xs">
                  ({reviewCount})
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
