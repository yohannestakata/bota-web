export function OrganizationJsonLd({
  name,
  url,
  logoUrl,
  sameAs,
}: {
  name: string;
  url: string;
  logoUrl?: string | null;
  sameAs?: string[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: logoUrl
      ? {
          "@type": "ImageObject",
          url: logoUrl,
        }
      : undefined,
    sameAs: sameAs && sameAs.length ? sameAs : undefined,
  } as const;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd({
  name,
  url,
  searchUrl,
}: {
  name: string;
  url: string;
  searchUrl?: string | null;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: searchUrl
      ? {
          "@type": "SearchAction",
          target: `${searchUrl}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
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
