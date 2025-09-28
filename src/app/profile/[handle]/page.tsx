import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { ReactionType } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import {
  getProfileByHandle,
  getUserReviewStats,
  getReviewsByAuthor,
  getPhotosByAuthor,
} from "@/lib/supabase/queries";
import { RatingStars } from "@/components/ui/rating-stars";
import ProfileTabs from "@/features/profile/components/profile-tabs.client";
import { formatDistanceToNowStrict } from "date-fns";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";
  const url = `${baseUrl}/profile/${handle}`;
  // We can't fetch server-side helpers here without importing queries; keep lightweight
  const title = `${handle} - Profile on Bota`;
  const description = `See ${handle}'s reviews and photos on Bota.`;
  const og = `${baseUrl}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  } satisfies import("next").Metadata;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return notFound();

  const [stats, reviews, photos] = await Promise.all([
    getUserReviewStats(profile.id),
    getReviewsByAuthor(profile.id, 8),
    getPhotosByAuthor(profile.id, 24),
  ]);

  // Fetch viewer's reaction for these reviews (server-side) like home cards
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      },
    );
    const {
      data: { user: viewer },
    } = await supabase.auth.getUser();
    if (viewer?.id && reviews.length) {
      type ReactionRow = { review_id: string; reaction_type: ReactionType };
      type ReviewWithReaction = {
        id: string;
        my_reaction?: ReactionType | null;
      };
      const reviewIds = reviews.map((r) => (r as ReviewWithReaction).id);
      const { data: reacts } = await supabase
        .from("review_reactions")
        .select("review_id, reaction_type")
        .eq("user_id", viewer.id)
        .in("review_id", reviewIds);
      const map = new Map<string, ReactionType | null>();
      for (const row of (reacts || []) as ReactionRow[]) {
        map.set(String(row.review_id), row.reaction_type);
      }
      for (const r of reviews as Array<ReviewWithReaction>) {
        r.my_reaction = map.get(String(r.id)) ?? null;
      }
    }
  } catch {}

  const memberSince = new Date(profile.created_at).toLocaleDateString();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* JSON-LD Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.full_name || profile.username || "User",
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com"}/profile/${profile.username || profile.id}`,
            image: profile.avatar_url || undefined,
            description: profile.bio || undefined,
          }),
        }}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-muted relative h-20 w-20 overflow-hidden rounded-full">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || profile.username || "User"}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xl">
              {(profile.full_name || profile.username || "U").charAt(0)}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-center text-4xl font-bold">
            {profile.full_name || profile.username || "User"}
          </h1>
          <div className="mt-1.5 text-center">
            Joined{" "}
            {formatDistanceToNowStrict(new Date(memberSince), {
              addSuffix: true,
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border border p-6">
          <div className="text-center text-3xl font-bold">
            {stats.totalReviews}
          </div>
          <div className="text-center text-sm">Reviews</div>
        </div>

        <div className="border-border flex flex-col items-center border p-6">
          <RatingStars rating={stats.averageRating} size={24} />{" "}
          <div className="mt-2 text-center text-sm">Avg rating</div>
        </div>

        <div className="border-border flex flex-col items-center border p-6">
          <div className="text-center text-3xl font-bold">
            {stats.totalReactions}
          </div>
          <div className="text-center text-sm">Reactions received</div>
        </div>
      </div>

      <ProfileTabs
        userId={profile.id}
        initialReviews={reviews}
        initialPhotos={photos}
      />
    </div>
  );
}
