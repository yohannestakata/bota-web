import Link from "next/link";
import { RatingStars } from "@/components/ui/rating-stars";
// Avoid async data fetching in client component; data is provided via props

// Type for similar places that can come from either getSimilarPlaces or RPC function
type SimilarPlace = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category_id?: number | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    icon_name?: string | null;
  };
  // Can have either place_stats (from getSimilarPlaces) or stats (from RPC)
  place_stats?: {
    review_count: number;
    average_rating?: number | null;
    last_reviewed_at?: string | null;
    photo_count: number;
  } | null;
  stats?: {
    review_count: number;
    average_rating?: number | null;
    last_reviewed_at?: string | null;
    photo_count: number;
  };
};

interface SimilarPlacesProps {
  categoryId?: number;
  excludePlaceId?: string;
  places?: SimilarPlace[];
}

export default function SimilarPlaces({
  categoryId,
  excludePlaceId,
  places,
}: SimilarPlacesProps) {
  const placesData: SimilarPlace[] = places || [];

  if (!placesData.length) return null;
  return (
    <div>
      <div className="grid gap-2 md:grid-cols-2">
        {placesData.map((p) => {
          // Handle both data formats: place_stats (from getSimilarPlaces) and stats (from RPC)
          const rating =
            p.place_stats?.average_rating ?? p.stats?.average_rating ?? 0;
          const reviewCount =
            p.place_stats?.review_count ?? p.stats?.review_count ?? 0;

          return (
            <Link
              key={p.id}
              href={`/place/${p.slug}`}
              className="border-border border p-4"
            >
              <div className="text-foreground font-semibold">{p.name}</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <RatingStars rating={rating} size={16} />
                <span>
                  {rating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
