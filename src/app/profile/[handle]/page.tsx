import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProfileByHandle,
  getUserReviewStats,
  getReviewsByAuthor,
} from "@/lib/supabase/queries";
import { RatingStars } from "@/components/ui/rating-stars";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return notFound();

  const [stats, reviews] = await Promise.all([
    getUserReviewStats(profile.id),
    getReviewsByAuthor(profile.id, 8),
  ]);

  const memberSince = new Date(profile.created_at).toLocaleDateString();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
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
            <div className="grid h-full w-full place-items-center text-sm">
              {(profile.full_name || profile.username || "U").charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">
            {profile.full_name || profile.username || "User"}
          </h1>
          <div className="text-muted-foreground text-sm">
            Member since {memberSince}
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border p-4">
          <div className="text-muted-foreground text-xs">Reviews</div>
          <div className="text-2xl font-semibold">{stats.totalReviews}</div>
        </div>
        <div className="border p-4">
          <div className="text-muted-foreground text-xs">Avg rating</div>
          <div className="flex items-center gap-2">
            <RatingStars rating={stats.averageRating} size={16} />
            <div className="text-2xl font-semibold">{stats.averageRating}</div>
          </div>
        </div>
        <div className="border p-4">
          <div className="text-muted-foreground text-xs">
            Reactions received
          </div>
          <div className="text-2xl font-semibold">{stats.totalReactions}</div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-medium">Recent reviews</h2>
      {reviews.length === 0 ? (
        <div className="text-muted-foreground">No reviews yet.</div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="border p-4">
              <div className="flex items-center justify-between">
                <Link
                  href={`/place/${r.place?.slug}`}
                  className="font-medium hover:underline"
                >
                  {r.place?.name || "Place"}
                </Link>
                <div className="flex items-center gap-2">
                  <RatingStars rating={r.rating} size={14} />
                  <span className="text-sm font-medium">{r.rating}</span>
                </div>
              </div>
              {r.photos && r.photos.length ? (
                <div className="relative mt-3 aspect-video overflow-hidden">
                  <Image
                    src={r.photos[0].file_path}
                    alt={r.photos[0].alt_text || "review photo"}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              {r.body ? (
                <p className="text-muted-foreground mt-3 line-clamp-3 text-sm">
                  {r.body}
                </p>
              ) : null}
              <div className="text-muted-foreground mt-2 text-xs">
                {new Date(r.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
