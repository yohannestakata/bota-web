"use client";

import { Suspense, useEffect } from "react";
import Gallery from "@/features/place/components/gallery";
import SimilarPlaces from "@/features/place/components/similar-places";
import Section from "@/features/place/components/section";
import Hours from "@/features/place/components/hours";
import Amenities from "@/features/place/components/amenities";
import Menu from "@/features/place/components/menu";
import BusinessQuickInfo from "@/features/place/components/business-quick-info";
import TopReview from "@/features/place/components/top-review";
import { RatingStars } from "@/components/ui/rating-stars";
import {
  LocationHoursSkeleton,
  // AmenitiesSkeleton,
  // MenuSkeleton,
  // SimilarPlacesSkeleton,
  // ReviewsSkeleton,
} from "@/features/place/components/skeletons";
import Reviews from "@/features/place/components/reviews";
import {
  PlaceWithStats,
  ReviewWithAuthor,
  MenuItemWithPhotos,
  MenuSection,
} from "@/lib/types/database";
import { getPlacePageData } from "@/lib/supabase/queries";
import { useAnalytics } from "@/hooks/use-analytics";

interface PlaceContentProps {
  place: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    my_saved?: boolean;
    category_name?: string | null;
    category_slug?: string | null;
    price_range?: number | null;
    city?: string | null;
    state?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    postal_code?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    website_url?: string | null;
    average_rating?: number | null;
    review_count?: number | null;
    top_review?: ReviewWithAuthor | null;
    hours?: Array<{
      day_of_week: number;
      open_time: string | null;
      close_time: string | null;
      is_closed: boolean;
      is_24_hours: boolean;
    }>;
    branches?: Array<{
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      phone?: string | null;
      website_url?: string | null;
      address_line1?: string | null;
      address_line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      is_main_branch: boolean;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;
    amenities?: Array<{
      amenity_type_id: number;
      value: boolean;
      amenity: {
        id: number;
        key: string;
        name: string;
        icon_name?: string | null;
      };
    }>;
    menu?: {
      sections?: MenuSection[];
      items?: MenuItemWithPhotos[];
    };
  };
  branch?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    city?: string | null;
    state?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    postal_code?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    website_url?: string | null;
    hours?: Array<{
      day_of_week: number;
      open_time: string | null;
      close_time: string | null;
      is_closed: boolean;
      is_24_hours: boolean;
    }>;
  };
  averageRating: number;
  reviewCount: number;
  isOpenNow?: boolean;
  photoCategories?: Array<{
    id: number;
    name: string;
    created_by?: string | null;
    is_global: boolean;
    created_at: string;
  }>;
  photos?: Array<{
    id: string;
    file_path: string;
    alt_text?: string | null;
    photo_category_id?: number | null;
    created_at: string;
  }>;
  activeCategoryId?: number | null;
  similarPlaces?: PlaceWithStats[];
  reviews?: ReviewWithAuthor[];
  showBackLink?: boolean;
  backLinkText?: string;
  backLinkHref?: string;
}

export default function PlaceContent({
  place,
  branch,
  averageRating,
  reviewCount,
  isOpenNow,
  photoCategories = [],
  photos = [],
  activeCategoryId = null,
  similarPlaces = [],
  reviews = [],
  showBackLink = false,
  backLinkText,
  backLinkHref,
}: PlaceContentProps) {
  const { trackPlaceView } = useAnalytics();

  // Track place view on component mount
  useEffect(() => {
    trackPlaceView(place, branch);
  }, [place.id, branch?.id, trackPlaceView]);
  // Use branch data if provided, otherwise use place data
  const displayName = branch?.name || place.name;
  const displayDescription = branch?.description || place.description;
  const displayCity = branch?.city || place.city;
  const displayState = branch?.state || place.state;
  // const displayAddress1 = branch?.address_line1 || place.address_line1;
  // const displayAddress2 = branch?.address_line2 || place.address_line2;
  // const displayPostalCode = branch?.postal_code || place.postal_code;
  // const displayCountry = branch?.country || place.country;
  const displayLatitude = branch?.latitude || place.latitude;
  const displayLongitude = branch?.longitude || place.longitude;
  // const displayPhone = branch?.phone || place.phone;
  // const displayWebsiteUrl = branch?.website_url || place.website_url;
  const displayHours = branch?.hours || place.hours;

  // Get the main branch ID for favorites
  const mainBranch = place.branches?.find((b) => b.is_main_branch);
  const mainBranchId = mainBranch?.id;

  // Use top review from the place data
  const topReview = place.top_review;

  // Breadcrumb JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://botareview.com"}/`,
      },
      place.category_name
        ? {
            "@type": "ListItem",
            position: 2,
            name: place.category_name,
            item: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://botareview.com"}/category/${place.category_slug}`,
          }
        : undefined,
      {
        "@type": "ListItem",
        position: place.category_name ? 3 : 2,
        name: displayName,
        item: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://botareview.com"}/place/${place.slug}${branch ? `/${branch.slug}` : ""}`,
      },
    ].filter(Boolean),
  } as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* OpenGraph / Twitter handled by generateMetadata; JSON-LD below */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Back link if needed */}
      {showBackLink && backLinkText && backLinkHref && (
        <div className="mb-4">
          <a
            href={backLinkHref}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
          >
            ← {backLinkText}
          </a>
        </div>
      )}

      {/* Main content */}
      <div className="mt-5 grid grid-cols-10 gap-24">
        <div className="col-span-6">
          <h1 className="text-foreground font-heading text-4xl font-bold tracking-tight">
            {displayName}
          </h1>
          <div className="mt-2.5 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <RatingStars rating={averageRating} size={24} />
              <span className="text-foreground">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm">
                ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm">
              {isOpenNow !== undefined ? (
                <span
                  className={`${
                    isOpenNow ? "text-green-600" : "text-red-600"
                  } font-semibold`}
                >
                  {isOpenNow ? "Open now" : "Closed for now"}
                </span>
              ) : (
                <span>Hours not set</span>
              )}
              {(place.category_name || place.price_range) && <span>•</span>}
              {(place.category_name || place.price_range) && (
                <span>
                  {place.category_name}
                  {place.category_name && place.price_range ? " • " : ""}
                  {place.price_range
                    ? "$".repeat(
                        Math.min(
                          Math.max(Number(place.price_range) || 0, 1),
                          4,
                        ),
                      )
                    : ""}
                </span>
              )}
              {(displayCity || displayState) && <span>•</span>}
              {(displayCity || displayState) && (
                <span>
                  {[displayCity, place.address_line1, place.address_line2]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
          </div>
          {/* Rating & Quick Info (mobile-first) */}
          <div className="lg:hidden">
            <BusinessQuickInfo
              place={place}
              branchId={mainBranchId}
              averageRating={averageRating}
              reviewCount={reviewCount}
              isOpenNow={isOpenNow}
              branches={place.branches}
            />
          </div>

          {/* Top review */}
          {topReview && <TopReview review={topReview} />}

          {/* Photos */}
          <Section title="Photos">
            <Gallery
              placeId={place.id}
              initialCategories={(photoCategories || []).map((c) => ({
                id: (c as { id: number | null }).id ?? null,
                name: (c as { name: string }).name,
                count: (c as unknown as { count?: number }).count ?? 0,
              }))}
              initialPhotos={photos}
              initialActiveCategoryId={activeCategoryId}
            />
          </Section>

          {/* Description + key details */}
          <div className="border-border border-b py-12">
            <p className="text-foreground leading-6">{displayDescription}</p>
          </div>

          {/* Location & Hours */}
          <Section title="Location & Hours">
            <Suspense fallback={<LocationHoursSkeleton />}>
              <Hours
                placeId={place.id}
                latitude={
                  displayLatitude != null ? Number(displayLatitude) : null
                }
                longitude={
                  displayLongitude != null ? Number(displayLongitude) : null
                }
                name={displayName}
                hours={displayHours}
              />
            </Suspense>
          </Section>

          {/* Amenities */}
          <Section title="Amenities">
            <Amenities amenities={place.amenities} />
          </Section>

          {/* Menu */}
          <Section title="Menu">
            <Menu menu={place.menu} />
          </Section>

          {/* Similar Places */}
          <Section title="Similar Places">
            <SimilarPlaces places={similarPlaces} />
          </Section>

          {/* Reviews */}
          <div id="reviews" />
          <Section title="Reviews">
            <Reviews reviews={reviews} />
          </Section>
        </div>

        <div className="col-span-4">
          <div className="sticky top-28">
            <div className="hidden lg:block">
              <BusinessQuickInfo
                place={place}
                branchId={mainBranchId}
                averageRating={averageRating}
                reviewCount={reviewCount}
                isOpenNow={isOpenNow}
                showRatingHeader={false}
                showCategoryAndPrice={false}
                showOpenStatus={false}
                branches={place.branches}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageData = await getPlacePageData(slug, null);
  if (!pageData) return { title: "Place not found" };
  const place = pageData.place;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://botareview.com";
  const url = `${baseUrl}/place/${place.slug}`;
  const title = `${place.name}`;
  const description =
    place.description ||
    `${place.name} — discover reviews, photos, menu, hours, and location.`;
  const ogImage = `${baseUrl}/place/${place.slug}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Bota",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
