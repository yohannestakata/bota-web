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
}) {
  const data = {
    "@context": "https://schema.org",
    // Default to LocalBusiness to cover non-restaurant categories; search engines can infer more specific types
    "@type": "LocalBusiness",
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
  } as const;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
