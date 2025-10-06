"use client";

import { Suspense, useEffect, useState } from "react";
import Gallery from "@/features/place/components/gallery";
import SimilarPlaces from "@/features/place/components/similar-places";
import Section from "@/features/place/components/section";
import SectionNav from "@/features/place/components/section-nav";
import Hours from "@/features/place/components/hours";
import Amenities from "@/features/place/components/amenities";
import Menu from "@/features/place/components/menu";
import BusinessQuickInfo from "@/features/place/components/business-quick-info";
import { PhoneIcon, GlobeIcon } from "lucide-react";
import TopReview from "@/features/place/components/top-review";
import { RatingStars } from "@/components/ui/rating-stars";
import { LocationHoursSkeleton } from "@/features/place/components/skeletons";
import Reviews from "@/features/place/components/reviews";
import {
  PlaceWithStats,
  ReviewWithAuthor,
  MenuItemWithPhotos,
  MenuSection,
} from "@/lib/types/database";
import { getPlacePageData } from "@/lib/supabase/queries";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  PlusIcon,
  MessageCircleIcon,
  ImagePlusIcon,
  PencilIcon,
  HeartIcon,
} from "lucide-react";
import AuthGate from "@/components/ui/auth-gate";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/auth-context";
import AddMenuItemDialog from "@/features/place/components/add-menu-item-dialog.client";
import Link from "next/link";

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
  console.log("place", place);
  const { trackPlaceView } = useAnalytics();
  const { user } = useAuth();

  // Add menu item dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [resolvedBranchId, setResolvedBranchId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(!!place.my_saved);
  const [saving, setSaving] = useState<boolean>(false);

  // Track place view on component mount
  useEffect(() => {
    trackPlaceView(place, branch);
  }, [trackPlaceView, place, branch]);
  // Use branch data if provided, otherwise use place data
  const displayName = branch?.name || place.name;
  const titleText = (() => {
    const branchNameFromRpc = (place as unknown as { branch_name?: string })
      .branch_name;
    if (
      branchNameFromRpc &&
      branchNameFromRpc.trim().toLowerCase() !== place.name.trim().toLowerCase()
    ) {
      return `${place.name} (${branchNameFromRpc})`;
    }
    return place.name;
  })();
  const displayDescription = branch?.description || place.description;
  const displayCity = branch?.city || place.city;
  const displayState = branch?.state || place.state;
  const displayLatitude = branch?.latitude || place.latitude;
  const displayLongitude = branch?.longitude || place.longitude;
  const displayHours = branch?.hours || place.hours;

  // Get the main branch ID for favorites
  const mainBranch = place.branches?.find((b) => b.is_main_branch);
  const mainBranchId = mainBranch?.id;

  // Resolve a usable branch id (prefer provided branch, then main, else fetch)
  useEffect(() => {
    let mounted = true;
    async function resolve() {
      if (branch?.id) {
        if (mounted) setResolvedBranchId(branch.id);
        return;
      }
      if (mainBranchId) {
        if (mounted) setResolvedBranchId(mainBranchId);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("branches")
          .select("id")
          .eq("place_id", place.id)
          .eq("is_main_branch", true)
          .maybeSingle();
        if (!mounted) return;
        if (error) {
          console.error("Failed to resolve branch id", error);
          setResolvedBranchId(null);
          return;
        }
        setResolvedBranchId((data as { id?: string } | null)?.id ?? null);
      } catch (e) {
        if (!mounted) return;
        console.error("Error resolving branch id", e);
        setResolvedBranchId(null);
      }
    }
    resolve();
    return () => {
      mounted = false;
    };
  }, [place.id, branch?.id, mainBranchId]);

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
    <div>
      <div className="mx-auto max-w-6xl py-6">
        {/* OpenGraph / Twitter handled by generateMetadata; JSON-LD below */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-10 md:gap-24">
          <div className="col-span-6">
            {/* Section navigation */}
            <div
              className="sticky top-14 -mt-6 md:top-18"
              style={{ zIndex: 9999 }}
            >
              <SectionNav />
            </div>

            <h1 className="text-foreground font-heading mt-8 px-4 text-3xl font-bold tracking-tight md:text-4xl">
              {titleText}
            </h1>

            <div className="mt-2.5 flex flex-col gap-1 px-4">
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
                    className={`${isOpenNow ? "text-green-700" : "text-destructive"} font-semibold`}
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
              {/* Contact row under title (4th row) */}
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                {place.phone ? (
                  <a
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-2 underline underline-offset-4"
                  >
                    <PhoneIcon size={16} /> {place.phone}
                  </a>
                ) : null}
                {place.website_url ? (
                  <a
                    href={place.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 underline underline-offset-4"
                  >
                    <GlobeIcon size={16} /> Visit website
                  </a>
                ) : null}
              </div>

              {/* Quick action buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2 md:hidden">
                <AuthGate
                  title="Sign in to write a review"
                  description="Create an account to write reviews."
                >
                  <Link
                    href={
                      place.slug ? `/reviews/add/${place.slug}` : "/reviews/add"
                    }
                    className="bg-primary text-primary-foreground flex items-center justify-center gap-2 p-3 text-sm"
                  >
                    <MessageCircleIcon size={16} />
                    <span>Write review</span>
                  </Link>
                </AuthGate>
                <AuthGate
                  title="Sign in to upload photos"
                  description="Create an account to upload photos."
                >
                  <Link
                    href={place.slug ? `/place/${place.slug}/photos/add` : "/"}
                    className="border-border flex items-center justify-center gap-2 border p-3 text-sm"
                  >
                    <ImagePlusIcon size={16} />
                    <span>Upload photos</span>
                  </Link>
                </AuthGate>
                <AuthGate
                  title="Sign in to save"
                  description="Create an account to save places."
                >
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      try {
                        setSaving(true);
                        let favoriteBranchId = resolvedBranchId;
                        if (!favoriteBranchId) {
                          const { data: mainBranchData } = await supabase
                            .from("branches")
                            .select("id")
                            .eq("place_id", place.id)
                            .eq("is_main_branch", true)
                            .maybeSingle();
                          favoriteBranchId =
                            (mainBranchData as { id?: string } | null)?.id ??
                            null;
                        }
                        if (!favoriteBranchId) return;
                        if (!isSaved) {
                          await supabase.from("favorite_branches").upsert({
                            user_id: (user as { id?: string } | null)?.id,
                            branch_id: favoriteBranchId,
                          });
                          setIsSaved(true);
                        } else {
                          await supabase
                            .from("favorite_branches")
                            .delete()
                            .eq(
                              "user_id",
                              (user as { id?: string } | null)?.id || "",
                            )
                            .eq("branch_id", favoriteBranchId);
                          setIsSaved(false);
                        }
                      } catch {
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className={`border-border flex w-full items-center justify-center gap-2 border p-3 text-sm transition-colors ${isSaved ? "bg-muted" : "hover:bg-muted"}`}
                  >
                    <HeartIcon
                      size={16}
                      strokeWidth={isSaved ? 3 : 2}
                      className={isSaved ? "text-primary" : ""}
                    />
                    <span>{isSaved ? "Saved" : "Save place"}</span>
                  </button>
                </AuthGate>
                <AuthGate
                  title="Sign in to request edit"
                  description="Create an account to request edits."
                >
                  <Link
                    href={
                      place.slug
                        ? `/place/${place.slug}/request-edit`
                        : "/place/request-edit"
                    }
                    className="border-border flex items-center justify-center gap-2 border p-3 text-sm"
                  >
                    <PencilIcon size={16} />
                    <span>Request edit</span>
                  </Link>
                </AuthGate>
              </div>
            </div>

            {/* Top review */}
            <div className="hidden px-4 md:block">
              {topReview && <TopReview review={topReview} />}
            </div>

            {/* Reviews (mobile only) - above Photos */}
            <div className="px-0 md:hidden">
              <div id="reviews-mobile" />
              <Section title="Reviews">
                <Reviews reviews={reviews} />
              </Section>
            </div>

            {/* Photos */}
            <Section id="photos" title="Photos">
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
            <div className="border-border hidden border-b px-4 py-12">
              <p className="text-foreground leading-6">{displayDescription}</p>
            </div>

            {/* Location & Hours */}
            <Section id="location-hours" title="Location & Hours">
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
            <Section id="amenities" title="Amenities">
              <Amenities amenities={place.amenities} />
            </Section>

            {/* Menu */}
            <Section
              id="menu"
              title="Menu"
              titleAction={
                <button
                  className="hover:bg-muted flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                  onClick={() => setAddOpen(true)}
                  disabled={!resolvedBranchId}
                >
                  <PlusIcon size={16} /> Add item
                </button>
              }
            >
              <Menu menu={place.menu} />
            </Section>

            {/* Similar Places */}
            <div className="hidden md:block">
              <Section id="similar-places-desktop" title="Similar Places">
                <SimilarPlaces places={similarPlaces} />
              </Section>
            </div>

            {/* Reviews (desktop only) */}
            <div className="hidden md:block">
              <div id="reviews" />
              <Section title="Reviews">
                <Reviews reviews={reviews} />
              </Section>
            </div>

            {/* Other Locations (mobile only) */}
            {place.branches && place.branches.length ? (
              <div className="md:hidden">
                <Section id="other-locations" title="Other Locations">
                  <div className="space-y-2">
                    {place.branches
                      ?.filter((b) => !b.is_main_branch)
                      .slice(0, 4)
                      .map((b) => (
                        <Link
                          key={b.id}
                          href={`/place/${place.slug}/${b.slug}`}
                          className="border-border block border p-4"
                        >
                          <div className="font-semibold">{b.name}</div>
                          <div className="mt-1 line-clamp-1 text-sm">
                            {[b.address_line1, b.city]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        </Link>
                      ))}
                  </div>
                </Section>
              </div>
            ) : null}

            {/* Similar Places only on mobile */}
            <div className="md:hidden">
              <Section id="similar-places-mobile" title="Similar Places">
                <SimilarPlaces places={similarPlaces} />
              </Section>
            </div>
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

        {/* Add menu item dialog */}
        <AddMenuItemDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          branchId={resolvedBranchId}
          onSaved={() => window.location.reload()}
        />
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
