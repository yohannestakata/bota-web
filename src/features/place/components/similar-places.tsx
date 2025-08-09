import Link from "next/link";
import { RatingStars } from "@/components/ui/rating-stars";

interface SimilarPlacesProps {
  places: {
    id: string;
    name: string;
    slug: string;
    place_stats?: {
      average_rating: number;
      review_count: number;
    };
  }[];
}

export default function SimilarPlaces({ places }: SimilarPlacesProps) {
  if (!places.length) return null;
  return (
    <div>
      <div className="grid gap-2 md:grid-cols-2">
        {places.map((p) => (
          <Link
            key={p.id}
            href={`/place/${p.slug}`}
            className="border-border rounded-3xl border px-4 py-3"
          >
            <div className="text-foreground font-medium">{p.name}</div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <RatingStars
                rating={p.place_stats?.average_rating ?? 0}
                size={14}
              />
              <span>{(p.place_stats?.average_rating ?? 0).toFixed(1)}</span>
              <span>·</span>
              <span>{p.place_stats?.review_count ?? 0} reviews</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
