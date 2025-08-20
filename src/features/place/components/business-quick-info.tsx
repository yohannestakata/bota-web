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
  showCategoryAndPrice = true,
  branches,
}: BusinessQuickInfoProps) {
  const priceRange = getPriceRangeDisplay(place.price_range);
  const { notify } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
      <div className="divide-border space-y-6 divide-y">
        {/* Contact Information */}
        <div className="pb-6">
          <div className="text-foreground text-lg font-semibold">Contact</div>
          <div className="mt-3 flex gap-6">
            {place.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon size={16} />
                <a
                  href={`tel:${place.phone}`}
                  className="text-foreground text-sm underline underline-offset-4"
                >
                  {place.phone}
                </a>
              </div>
            )}

            {place.website_url && (
              <div className="flex items-center gap-2">
                <GlobeIcon size={16} />
                <a
                  href={place.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground text-sm underline underline-offset-4"
                >
                  Visit website
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Other Branches */}
        {branches && branches.length > 0 && (
          <>
            <div className="space-y-3 pb-6">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Other Locations</span>
                <span className="text-base">
                  ({branches.filter((branch) => !branch.is_main_branch).length})
                </span>
              </div>
              <div className="space-y-2">
                {branches
                  .filter((branch) => !branch.is_main_branch)
                  .slice(0, 2) // Show max 2 other branches
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
                        className="border-border block rounded-xl border p-4"
                      >
                        <div className="font-semibold">{branch.name}</div>
                        {branchAddress && (
                          <div className="mt-1 line-clamp-1 text-sm">
                            {branchAddress}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                {branches.filter((branch) => !branch.is_main_branch).length >
                  3 && (
                  <div className="text-sm">
                    +
                    {branches.filter((branch) => !branch.is_main_branch)
                      .length - 2}{" "}
                    more locations
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link
            href={place.slug ? `/reviews/add/${place.slug}` : "/reviews/add"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-colors"
          >
            <MessageCircleIcon size={16} className="text-primary-foreground" />
            Write a Review
          </Link>

          <Link
            href={place.slug ? `/place/${place.slug}/photos/add` : "/"}
            className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 transition-colors"
          >
            <ImagePlusIcon size={16} />
            Upload Photos/Video
          </Link>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 transition-colors disabled:opacity-60 ${isSaved ? "border-amber-200 bg-amber-50 text-amber-600" : "border-border hover:bg-muted border"}`}
            >
              <HeartIcon
                size={14}
                className={isSaved ? "text-amber-600" : ""}
              />
              {isSaved ? "Saved" : "Save"}
            </button>

            <Link
              href={place.slug ? `/place/${place.slug}/request-edit` : "/"}
              className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 transition-colors"
            >
              <PencilIcon size={14} />
              Edit
            </Link>

            <button
              type="button"
              onClick={onShare}
              className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 transition-colors"
            >
              <Share2Icon size={14} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
