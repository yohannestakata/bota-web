import { MapPin, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import { RatingStars } from "@/components/ui/rating-stars";

interface PlaceCardProps {
  place: {
    id: string; // use UUID
    slug?: string;
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    image: string;
    tags: string[];
  };
}

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Link
      href={`/place/${place.slug || place.id}`}
      className="border-border overflow-hidden border transition-all duration-200"
    >
      <div className="bg-muted relative flex aspect-video items-center justify-center">
        <Image
          className="object-cover"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          src={normalizeImageSrc(place.image)}
          alt={place.name}
        />
      </div>
      <div>
        <div className="mt-2 flex items-center justify-between px-3">
          <div className="flex-1">
            <h3 className="text-foreground font-medium transition-colors">
              {place.name}
            </h3>
            <p className="text-muted-foreground text-sm">{place.category}</p>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <RatingStars rating={place.rating} size={16} />
            <span className="text-sm font-medium">{place.rating}</span>
          </div>
        </div>

        <div className="text-muted-foreground mt-2 flex items-center gap-4 px-3 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {place.reviewCount}{" "}
              {place.reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{place.category}</span>
          </div>
        </div>

        <div className="mt-3 mb-3 flex flex-wrap gap-1 px-3">
          {place.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="bg-muted text-muted-foreground inline-block rounded-full px-2 py-1 text-xs"
            >
              {tag}
            </span>
          ))}
          {place.tags.length > 2 && (
            <span className="bg-muted text-muted-foreground inline-block rounded-full px-2 py-1 text-xs">
              +{place.tags.length - 2} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
