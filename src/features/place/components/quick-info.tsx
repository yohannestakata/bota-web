import {
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
  TagIcon,
  DollarSignIcon,
} from "lucide-react";

interface QuickInfoProps {
  place: {
    phone?: string | null;
    website_url?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    price_range?: number | null;
    tags?: string[] | null;
    category?: {
      name: string;
    } | null;
  };
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

export default function QuickInfo({ place }: QuickInfoProps) {
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
    <div>
      <h3 className="mb-4 text-lg font-medium">Quick Info</h3>

      <div className="space-y-4">
        {/* Category & Price Range */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon size={16} className="text-muted-foreground" />
            <span className="text-sm">
              {place.category?.name || "Restaurant"}
            </span>
          </div>
          {priceRange && (
            <div className="flex items-center gap-1">
              <DollarSignIcon size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium text-green-600">
                {priceRange.symbol}
              </span>
              <span className="text-muted-foreground text-xs">
                {priceRange.label}
              </span>
            </div>
          )}
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-2">
            <MapPinIcon
              size={16}
              className="text-muted-foreground mt-0.5 flex-shrink-0"
            />
            <span className="text-sm leading-relaxed">{address}</span>
          </div>
        )}

        {/* Phone */}
        {place.phone && (
          <div className="flex items-center gap-2">
            <PhoneIcon size={16} className="text-muted-foreground" />
            <a
              href={`tel:${place.phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {place.phone}
            </a>
          </div>
        )}

        {/* Website */}
        {place.website_url && (
          <div className="flex items-center gap-2">
            <GlobeIcon size={16} className="text-muted-foreground" />
            <a
              href={place.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Visit Website
            </a>
          </div>
        )}

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <div>
            <div className="text-muted-foreground mb-2 text-xs font-medium">
              FEATURES
            </div>
            <div className="flex flex-wrap gap-1">
              {place.tags.slice(0, 6).map((tag, index) => (
                <span
                  key={index}
                  className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
              {place.tags.length > 6 && (
                <span className="text-muted-foreground text-xs">
                  +{place.tags.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
