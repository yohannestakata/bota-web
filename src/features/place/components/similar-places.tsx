import Link from "next/link";
import { RatingStars } from "@/components/ui/rating-stars";
import { getSimilarPlaces } from "@/lib/supabase/queries";
import { PlaceWithStats } from "@/lib/types/database";

interface SimilarPlacesProps {
  categoryId?: number;
  excludePlaceId?: string;
  places?: PlaceWithStats[];
}

export default async function SimilarPlaces({
  categoryId,
  excludePlaceId,
  places,
}: SimilarPlacesProps) {
  // If places are provided, use them; otherwise fetch from categoryId and excludePlaceId
  const placesData =
    places ||
    (categoryId && excludePlaceId
      ? await getSimilarPlaces(categoryId, excludePlaceId, 6).catch(() => [])
      : []);
  if (!placesData.length) return null;
  return (
    <div>
      <div className="grid gap-2 md:grid-cols-2">
        {placesData.map((p) => (
          <Link
            key={p.id}
            href={`/place/${p.slug}`}
            className="border-border rounded-3xl border p-4"
          >
            <div className="text-foreground font-semibold">{p.name}</div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <RatingStars
                rating={p.place_stats?.average_rating ?? 0}
                size={16}
              />
              <span>
                {(p.place_stats?.average_rating ?? 0).toFixed(1)} (
                {p.place_stats?.review_count ?? 0} reviews)
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
