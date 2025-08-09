export function PlaceJsonLd({
  name,
  description,
  url,
  averageRating,
  reviewCount,
  address,
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
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    description: description || undefined,
    url,
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
