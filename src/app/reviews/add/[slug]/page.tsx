import { notFound, redirect } from "next/navigation";
import {
  getPlaceBySlugWithDetails,
  getMenuItemsForPlace,
  getPhotoCategories,
  getReviewsForPlace,
} from "@/lib/supabase/queries";
import { Suspense } from "react";
import AddReviewForm from "@/features/reviews/components/add-review-form.client";
import { RatingStars } from "@/components/ui/rating-stars";
import Image from "next/image";
import { formatTimeAgo } from "@/lib/utils/timeago";

export const dynamic = "force-dynamic";

export default async function AddReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlugWithDetails(slug);
  if (!place) return notFound();

  const [menuItems, categories, reviewsRaw] = await Promise.all([
    getMenuItemsForPlace(place.id).catch(() => []),
    getPhotoCategories().catch(() => []),
    getReviewsForPlace(place.id, 12).catch(() => []),
  ]);

  const popular = (reviewsRaw || [])
    .slice()
    .sort((a, b) => {
      const ra = a.review_stats?.total_reactions || 0;
      const rb = b.review_stats?.total_reactions || 0;
      if (rb !== ra) return rb - ra;
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return bt - at;
    })
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-7">
          <h1 className="font-heading mb-6 text-3xl font-semibold">
            {place.name}
          </h1>
          <Suspense fallback={null}>
            {/* Client component handles auth gate and submission */}
            <AddReviewForm
              placeId={place.id}
              placeSlug={place.slug}
              menuItems={menuItems}
              categories={categories}
            />
          </Suspense>
        </div>
        <aside className="col-span-12 lg:col-span-5">
          <div className="mb-3 text-lg font-semibold">What people loved</div>
          {popular.length === 0 ? (
            <div className="text-muted-foreground text-sm">No reviews yet</div>
          ) : (
            <ul className="space-y-5">
              {popular.map((r) => {
                const avatar = r.author?.avatar_url;
                const name =
                  r.author?.full_name || r.author?.username || "User";
                const timeAgo = formatTimeAgo(r.created_at);
                return (
                  <li key={r.id} className="flex gap-3">
                    <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-sm font-medium">
                          {name.toString().trim().charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">{name}</div>
                        <div className="text-muted-foreground text-xs">
                          {timeAgo}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <RatingStars rating={r.rating} size={14} />
                        <span className="text-muted-foreground text-xs">
                          {r.review_stats?.total_reactions || 0} reactions
                        </span>
                      </div>
                      {r.body ? (
                        <p className="mt-1 line-clamp-2 text-sm">{r.body}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
