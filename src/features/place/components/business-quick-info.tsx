"use client";

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
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/app/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getFriendlyErrorMessage } from "@/lib/errors";
import Link from "next/link";

interface BusinessQuickInfoProps {
  place: {
    id: string;
    name: string;
    slug?: string;
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
  branchId?: string; // For favorites - if not provided, uses place.id
  averageRating?: number;
  reviewCount?: number;
  isOpenNow?: boolean;
  showRatingHeader?: boolean;
  showCategoryAndPrice?: boolean;
  showOpenStatus?: boolean;
  branches?: Array<{
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    website_url?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    is_main_branch: boolean;
  }>;
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
  branchId,
  averageRating,
  reviewCount,
  isOpenNow,
  showRatingHeader = true,
  showCategoryAndPrice = true,
  showOpenStatus = true,
  branches,
}: BusinessQuickInfoProps) {
  const priceRange = getPriceRangeDisplay(place.price_range);
  const { notify } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const address = [
    [place.address_line1, place.address_line2].filter(Boolean).join(" "),
    [place.city, place.state, place.postal_code].filter(Boolean).join(", "),
    place.country,
  ]
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: place.name, url });
        return;
      }
    } catch {}
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        notify("Link copied", "success");
        return;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      notify("Link copied", "success");
      return;
    } catch {
      try {
        // Last-resort fallback
        window.prompt("Copy this link", url);
      } catch {}
      notify("Something went wrong—please try again.", "error");
    }
  };

  const onSave = async () => {
    if (!user) {
      notify("Please sign in to continue.", "error");
      return;
    }
    // Optimistic toggle
    const next = !isSaved;
    setIsSaved(next);
    setSaving(true);
    try {
      const favoriteId = branchId || place.id;
      if (next) {
        const { error } = await supabase
          .from("favorite_branches")
          .upsert({ user_id: user.id, branch_id: favoriteId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorite_branches")
          .delete()
          .eq("user_id", user.id)
          .eq("branch_id", favoriteId);
        if (error) throw error;
      }
    } catch (err) {
      // Revert optimistic change on failure
      setIsSaved((v) => !v);
      notify(getFriendlyErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  // Load initial saved state
  useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.id) return;
      const favoriteId = branchId || place.id;
      const { data, error } = await supabase
        .from("favorite_branches")
        .select("branch_id")
        .eq("user_id", user.id)
        .eq("branch_id", favoriteId)
        .maybeSingle();
      if (!active) return;
      if (!error && data) setIsSaved(true);
    })();
    return () => {
      active = false;
    };
  }, [user?.id, place.id, branchId]);

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

        {/* Other Branches */}
        {branches && branches.length > 0 && (
          <>
            <hr className="border-border" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPinIcon size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">
                  Other Locations (
                  {branches.filter((branch) => !branch.is_main_branch).length})
                </span>
              </div>
              <div className="space-y-2">
                {branches
                  .filter((branch) => !branch.is_main_branch)
                  .slice(0, 3) // Show max 3 other branches
                  .map((branch) => {
                    const branchAddress = [
                      [branch.address_line1, branch.address_line2]
                        .filter(Boolean)
                        .join(" "),
                      [branch.city, branch.state].filter(Boolean).join(", "),
                    ]
                      .filter(Boolean)
                      .slice(0, 2)
                      .join(" · ");

                    return (
                      <Link
                        key={branch.id}
                        href={`/place/${place.slug}/${branch.slug}`}
                        className="block rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium">{branch.name}</div>
                        {branchAddress && (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {branchAddress}
                          </div>
                        )}
                        {branch.phone && (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {branch.phone}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                {branches.filter((branch) => !branch.is_main_branch).length >
                  3 && (
                  <div className="text-muted-foreground text-center text-xs">
                    +
                    {branches.filter((branch) => !branch.is_main_branch)
                      .length - 3}{" "}
                    more locations
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <hr className="border-border" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onShare}
              className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors"
            >
              <Share2Icon size={16} className="text-muted-foreground" />
              Share
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-60 ${isSaved ? "border-red-200 bg-red-50 text-red-700" : "border-border hover:bg-muted border"}`}
            >
              <HeartIcon
                size={16}
                className={isSaved ? "text-red-600" : "text-muted-foreground"}
              />
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>

          <Link
            href={place.slug ? `/reviews/add/${place.slug}` : "/reviews/add"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors"
          >
            <MessageCircleIcon size={16} className="text-primary-foreground" />
            Write a Review
          </Link>

          <div className="grid grid-cols-1 gap-2">
            <Link
              href={place.slug ? `/place/${place.slug}/photos/add` : "/"}
              className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors"
            >
              <ImagePlusIcon size={16} className="text-muted-foreground" />
              Upload Photos/Video
            </Link>

            <Link
              href={place.slug ? `/place/${place.slug}/request-edit` : "/"}
              className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors"
            >
              <PencilIcon size={16} className="text-muted-foreground" />
              Request Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
