"use client";

import {
  PhoneIcon,
  GlobeIcon,
  MessageCircleIcon,
  PencilIcon,
  ImagePlusIcon,
  Share2Icon,
  HeartIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/app/auth-context";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getFriendlyErrorMessage } from "@/lib/errors";
import Link from "next/link";
import Image from "next/image";
import LocationsDialog from "./locations-dialog";
import AuthGate from "@/components/ui/auth-gate";

interface BusinessQuickInfoProps {
  place: {
    id: string;
    name: string;
    slug?: string;
    my_saved?: boolean;
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

export default function BusinessQuickInfo({
  place,
  branchId,
  branches,
  averageRating,
  reviewCount,
}: BusinessQuickInfoProps) {
  const { notify } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(!!place.my_saved);
  const [locationsOpen, setLocationsOpen] = useState(false);

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
    if (!user) return; // AuthGate will handle this

    // Check if user profile exists, create if it doesn't
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        // Create profile if it doesn't exist
        const { error: createError } = await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0] || "user",
          full_name: user.email?.split("@")[0] || "User",
        });

        if (createError) throw createError;
      }
    } catch (profileErr) {
      console.error("Profile creation error:", profileErr);
      notify("Failed to create user profile. Please try again.", "error");
      return;
    }

    // Optimistic toggle
    const next = !isSaved;
    setIsSaved(next);
    setSaving(true);
    try {
      let favoriteBranchId = branchId;
      if (!favoriteBranchId && branches) {
        const mainBranch = branches.find((b) => b.is_main_branch);
        favoriteBranchId = mainBranch?.id;
      }

      if (!favoriteBranchId) {
        const { data: mainBranchData } = await supabase
          .from("branches")
          .select("id")
          .eq("place_id", place.id)
          .eq("is_main_branch", true)
          .maybeSingle();
        favoriteBranchId = mainBranchData?.id;
      }

      if (!favoriteBranchId) {
        throw new Error("No branch found to favorite");
      }

      if (next) {
        const { error } = await supabase
          .from("favorite_branches")
          .upsert({ user_id: user.id, branch_id: favoriteBranchId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorite_branches")
          .delete()
          .eq("user_id", user.id)
          .eq("branch_id", favoriteBranchId);
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

      // Get the branch ID to check - either the specific branch or the main branch
      let favoriteBranchId = branchId;
      if (!favoriteBranchId && branches) {
        const mainBranch = branches.find((b) => b.is_main_branch);
        favoriteBranchId = mainBranch?.id;
      }

      // If we still don't have a branch ID, try to fetch the main branch from the database
      if (!favoriteBranchId) {
        const { data: mainBranchData } = await supabase
          .from("branches")
          .select("id")
          .eq("place_id", place.id)
          .eq("is_main_branch", true)
          .maybeSingle();
        favoriteBranchId = mainBranchData?.id;
      }

      if (!favoriteBranchId) return;

      console.log("Checking saved state for branch:", favoriteBranchId);

      const { data, error } = await supabase
        .from("favorite_branches")
        .select("branch_id")
        .eq("user_id", user.id)
        .eq("branch_id", favoriteBranchId)
        .maybeSingle();

      if (!active) return;

      console.log("Saved state result:", { data, error, isSaved: !!data });

      if (!error && data) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id, place.id, branchId, branches]);

  return (
    <div className="border-border border p-6 shadow-xl">
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
                        className="border-border block border p-4"
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
                  2 && (
                  <button
                    type="button"
                    onClick={() => setLocationsOpen(true)}
                    className="text-primary text-sm hover:underline"
                  >
                    View all locations (+
                    {branches.filter((b) => !b.is_main_branch).length - 2})
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link
            href={place.slug ? `/reviews/add/${place.slug}` : "/reviews/add"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 px-6 py-3 font-semibold transition-colors"
          >
            <MessageCircleIcon size={16} className="text-primary-foreground" />
            Write a Review
          </Link>

          <Link
            href={place.slug ? `/place/${place.slug}/photos/add` : "/"}
            className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 border px-6 py-3 transition-colors"
          >
            <ImagePlusIcon size={16} />
            Upload Photos/Video
          </Link>

          <div className="grid grid-cols-3 gap-2">
            <AuthGate
              title="Sign in to save places"
              description="Create an account to save your favorite places."
            >
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className={`border-border hover:bg-muted flex w-full cursor-pointer items-center justify-center gap-2 border px-4 py-3 transition-colors disabled:opacity-60 ${isSaved ? "bg-muted" : ""}`}
              >
                <HeartIcon
                  size={16}
                  strokeWidth={isSaved ? 3 : 2}
                  className={isSaved ? "text-primary" : ""}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
            </AuthGate>

            <Link
              href={place.slug ? `/place/${place.slug}/request-edit` : "/"}
              className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 border px-4 py-3 transition-colors"
            >
              <PencilIcon size={16} />
              Edit
            </Link>

            <button
              type="button"
              onClick={onShare}
              className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 border px-4 py-3 transition-colors"
            >
              <Share2Icon size={16} />
              Share
            </button>
          </div>
        </div>
      </div>

      <LocationsDialog
        open={locationsOpen}
        onOpenChange={setLocationsOpen}
        placeName={place.name}
        averageRating={averageRating}
        reviewCount={reviewCount}
        branches={branches || []}
        placeSlug={place.slug}
      />
    </div>
  );
}
