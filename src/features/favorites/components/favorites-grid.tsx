import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import UnsaveFavoriteButton from "./unsave-favorite-button.client";
import { RatingStars } from "@/components/ui/rating-stars";
import { BranchWithDetails, BranchPhoto } from "@/lib/types/database";

export default async function FavoritesGrid() {
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
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return (
      <p className="text-muted-foreground text-sm">
        Please sign in to view your saved places.
      </p>
    );
  }

  // 1) Fetch favorite branch ids
  const { data: favRows, error: favError } = await supabase
    .from("favorite_branches")
    .select("branch_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  console.log("[favorites] favError", favError);
  type FavRow = { branch_id: string; created_at: string };
  const branchIds = ((favRows || []) as FavRow[]).map((r) => r.branch_id);
  console.log("[favorites] branchIds", branchIds.length);

  if (!branchIds.length) {
    return <p className="text-muted-foreground text-sm">No favorites yet.</p>;
  }

  // 2) Fetch enriched details from view
  const { data: details, error: detailsError } = await supabase
    .from("branches_with_details")
    .select("*")
    .in("branch_id", branchIds);
  console.log("[favorites] detailsError", detailsError);

  // 3) Fetch latest photo per branch for thumbnail
  const { data: photosData, error: photosError } = await supabase
    .from("branch_photos")
    .select("branch_id, file_path, created_at")
    .in("branch_id", branchIds)
    .order("created_at", { ascending: false });
  console.log("[favorites] photosError", photosError);
  const firstPhotoByBranch = new Map<string, string>();
  for (const row of (photosData || []) as Array<
    Pick<BranchPhoto, "branch_id" | "file_path" | "created_at">
  >) {
    if (!firstPhotoByBranch.has(row.branch_id)) {
      firstPhotoByBranch.set(row.branch_id, row.file_path);
    }
  }

  function computeIsOpenNow(
    hours:
      | Array<{
          day_of_week: number;
          open_time: string | null;
          close_time: string | null;
          is_closed: boolean;
          is_24_hours: boolean;
        }>
      | null
      | undefined,
  ): boolean | undefined {
    try {
      if (!Array.isArray(hours) || !hours.length) return undefined;
      const now = new Date();
      const currentDay = now.getDay();
      const row = hours.find((h) => h.day_of_week === currentDay);
      if (!row) return undefined;
      if (row.is_24_hours) return true;
      if (row.is_closed) return false;
      if (row.open_time && row.close_time) {
        const [oH, oM] = row.open_time.split(":").map((n) => Number(n));
        const [cH, cM] = row.close_time.split(":").map((n) => Number(n));
        const openMinutes = (oH || 0) * 60 + (oM || 0);
        const closeMinutes = (cH || 0) * 60 + (cM || 0);
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        if (closeMinutes >= openMinutes) {
          return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
        }
        return (
          nowMinutes >= openMinutes ||
          nowMinutes < (closeMinutes + 24 * 60) % (24 * 60)
        );
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  const detailMap = new Map<string, BranchWithDetails>();
  for (const d of (details || []) as BranchWithDetails[]) {
    detailMap.set(d.branch_id, d);
  }
  const rows = branchIds
    .map((id) => {
      const d = detailMap.get(id);
      if (!d) return undefined;
      const image_path = firstPhotoByBranch.get(id) || null;
      const isOpenNow = computeIsOpenNow(d.hours);
      return {
        id: d.branch_id,
        branchName: d.branch_name,
        placeName: d.place_name || "",
        slug: d.place_slug || "",
        city: d.branch_city,
        state: d.branch_state,
        categoryName: d.category_name,
        averageRating: Number(d.average_rating || 0),
        image_path,
        isOpenNow,
      } as {
        id: string;
        branchName: string;
        placeName: string;
        slug: string;
        city: string | null;
        state: string | null;
        categoryName: string | null;
        averageRating: number;
        image_path: string | null;
        isOpenNow?: boolean | undefined;
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    branchName: string;
    placeName: string;
    slug: string;
    city: string | null;
    state: string | null;
    categoryName: string | null;
    averageRating: number;
    image_path: string | null;
    isOpenNow?: boolean | undefined;
  }>;

  console.log("[favorites] mapped", rows.length);

  if (!rows || rows.length === 0) {
    return <p className="text-muted-foreground text-sm">No favorites yet.</p>;
  }

  return (
    <div className="mt-5 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((p) => (
        <div
          key={p.id}
          className="border-border flex flex-col justify-between gap-3 border p-6"
        >
          <div>
            <div className="bg-muted relative aspect-video w-full">
              {p.image_path ? (
                <Image
                  src={normalizeImageSrc(p.image_path)}
                  alt={`${p.placeName} (${p.branchName})`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="mt-3 flex-1">
              <div className="flex flex-col gap-1">
                <Link
                  href={`/place/${p.slug}`}
                  className="text-foreground font-bold underline-offset-4 hover:underline"
                >
                  {p.placeName}
                  {p.branchName && p.branchName !== p.placeName
                    ? ` (${p.branchName})`
                    : ""}
                </Link>
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    {p.categoryName || "Restaurant"}
                  </div>
                  <span>•</span>
                  {p.isOpenNow !== undefined ? (
                    <span
                      className={`${p.isOpenNow ? "text-green-700" : "text-destructive"} text-sm font-semibold`}
                    >
                      {p.isOpenNow ? "Open now" : "Closed for now"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Unknown hours
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-1">
                <RatingStars rating={p.averageRating || 0} size={16} />
              </div>
            </div>
          </div>
          <UnsaveFavoriteButton userId={user.id} branchId={p.id} />
        </div>
      ))}
    </div>
  );
}
