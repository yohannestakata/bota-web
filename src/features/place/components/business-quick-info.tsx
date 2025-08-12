import {
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
  TagIcon,
  ClockIcon,
  MessageCircleIcon,
  PencilIcon,
  ImagePlusIcon,
  Share2Icon,
  HeartIcon,
} from "lucide-react";
import { RatingStars } from "@/components/ui/rating-stars";

interface BusinessQuickInfoProps {
  place: {
    id: string;
    name: string;
    phone?: string | null;
    website_url?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    price_range?: number | null;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
  averageRating?: number;
  reviewCount?: number;
  isOpenNow?: boolean;
  showRatingHeader?: boolean;
  showCategoryAndPrice?: boolean;
  showOpenStatus?: boolean;
}

function getPriceRangeDisplay(priceRange: number | null | undefined) {
  if (!priceRange) return null;

  const ranges = {
    1: { symbol: "$", label: "Inexpensive" },
    2: { symbol: "$$", label: "Moderate" },
    3: { symbol: "$$$", label: "Expensive" },
    4: { symbol: "$$$$", label: "Very Expensive" },
  };

  return ranges[priceRange as keyof typeof ranges] || null;
}

export default function BusinessQuickInfo({
  place,
  averageRating,
  reviewCount,
  isOpenNow,
  showRatingHeader = true,
  showCategoryAndPrice = true,
  showOpenStatus = true,
}: BusinessQuickInfoProps) {
  const priceRange = getPriceRangeDisplay(place.price_range);

  const address = [
    [place.address_line1, place.address_line2].filter(Boolean).join(" "),
    [place.city, place.state, place.postal_code].filter(Boolean).join(", "),
    place.country,
  ]
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");

  return (
    <div className="border-border rounded-3xl border p-6 shadow-xl">
      {/* Rating Header */}
      {showRatingHeader &&
        averageRating !== undefined &&
        reviewCount !== undefined && (
          <div className="mb-6 flex flex-col items-center gap-1 text-center">
            <span className="text-4xl font-medium">
              {averageRating.toFixed(1)}
            </span>

            <RatingStars rating={averageRating} size={24} />

            <span className="text-sm">
              ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
            </span>
          </div>
        )}

      <div className="space-y-4">
        {/* Category & Price Range */}
        {showCategoryAndPrice && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TagIcon size={16} className="text-muted-foreground" />
              <span className="text-sm">
                {place.category?.name || "Business"}
              </span>
            </div>
            {priceRange && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-green-600">
                  {priceRange.symbol}
                </span>
                <span className="text-muted-foreground text-xs">
                  {priceRange.label}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Open/Closed Status */}
        {showOpenStatus && isOpenNow !== undefined && (
          <div className="flex items-center gap-2">
            <ClockIcon size={16} className="text-muted-foreground" />
            <span
              className={`text-sm font-medium ${
                isOpenNow ? "text-green-600" : "text-red-600"
              }`}
            >
              {isOpenNow ? "Open now" : "Closed"}
            </span>
          </div>
        )}

        <hr className="border-border" />

        {/* Contact Information */}
        <div className="space-y-3">
          {place.phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon
                size={16}
                className="text-muted-foreground flex-shrink-0"
              />
              <a
                href={`tel:${place.phone}`}
                className="text-foreground text-sm underline underline-offset-4 hover:no-underline"
              >
                {place.phone}
              </a>
            </div>
          )}

          {place.website_url && (
            <div className="flex items-center gap-3">
              <GlobeIcon
                size={16}
                className="text-muted-foreground flex-shrink-0"
              />
              <a
                href={place.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-foreground text-sm underline underline-offset-4 hover:no-underline"
              >
                Visit website
              </a>
            </div>
          )}

          {address && (
            <div className="flex items-start gap-3">
              <MapPinIcon
                size={16}
                className="text-muted-foreground mt-0.5 flex-shrink-0"
              />
              <span className="text-sm leading-relaxed">{address}</span>
            </div>
          )}
        </div>

        <hr className="border-border" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors">
              <Share2Icon size={16} className="text-muted-foreground" />
              Share
            </button>
            <button className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors">
              <HeartIcon size={16} className="text-muted-foreground" />
              Save
            </button>
          </div>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors">
            <MessageCircleIcon size={16} className="text-primary-foreground" />
            Write a Review
          </button>

          <div className="grid grid-cols-1 gap-2">
            <button className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors">
              <ImagePlusIcon size={16} className="text-muted-foreground" />
              Upload Photos/Video
            </button>
            <button className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors">
              <PencilIcon size={16} className="text-muted-foreground" />
              Request Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
