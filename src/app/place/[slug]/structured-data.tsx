export function PlaceJsonLd({
  name,
  description,
  url,
  averageRating,
  reviewCount,
  address,
  telephone,
  priceRange,
  geo,
  image,
  businessType,
  openingHours,
  servesCuisine,
  menuUrl,
}: {
  name: string;
  description?: string | null;
  url: string;
  averageRating?: number;
  reviewCount?: number;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  telephone?: string | null;
  priceRange?: string | number | null;
  geo?: { latitude?: number | null; longitude?: number | null };
  image?: string | string[] | null;
  businessType?: string | null;
  openingHours?: Array<{
    dayOfWeek: string | string[];
    opens?: string | null;
    closes?: string | null;
  }> | null;
  servesCuisine?: string | string[] | null;
  menuUrl?: string | null;
}) {
  const data = {
    "@context": "https://schema.org",
    // Default to LocalBusiness; allow overriding with a more specific type (e.g., "Restaurant")
    "@type": businessType || "LocalBusiness",
    name,
    description: description || undefined,
    url,
    image: image || undefined,
    telephone: telephone || undefined,
    priceRange:
      typeof priceRange === "number"
        ? "$".repeat(Math.min(Math.max(priceRange || 0, 1), 4))
        : priceRange || undefined,
    geo:
      geo && (geo.latitude || geo.longitude)
        ? {
            "@type": "GeoCoordinates",
            latitude: geo.latitude || undefined,
            longitude: geo.longitude || undefined,
          }
        : undefined,
    aggregateRating:
      averageRating && reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            reviewCount,
          }
        : undefined,
    address:
      address && Object.values(address).some(Boolean)
        ? {
            "@type": "PostalAddress",
            ...address,
          }
        : undefined,
    openingHoursSpecification:
      openingHours && openingHours.length
        ? openingHours.map((oh) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: oh.dayOfWeek,
            opens: oh.opens || undefined,
            closes: oh.closes || undefined,
          }))
        : undefined,
    servesCuisine: servesCuisine || undefined,
    menu: menuUrl || undefined,
  } as const;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
