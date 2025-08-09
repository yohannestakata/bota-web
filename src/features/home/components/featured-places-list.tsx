import { getFeaturedPlaces } from "@/lib/supabase/queries";
import PlaceCard from "./place-card";

export default async function FeaturedPlacesList() {
  try {
    const places = await getFeaturedPlaces(10);

    // Shape data directly from the enriched view
    const transformedPlaces = places.map((place) => ({
      id: place.id, // keep UUID for stable routing
      slug: place.slug,
      name: place.name,
      category: place.category_name || "",
      rating: place.average_rating || 0,
      reviewCount: place.review_count || 0,
      // Distance not available without geolocation; omit for now
      image:
        place.cover_image_path ||
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      tags: Array.isArray(place.tags) ? place.tags : [],
    }));

    return (
      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {transformedPlaces.length === 0 ? (
          <div className="text-muted-foreground col-span-full text-center text-sm">
            No featured places yet. Check back soon.
          </div>
        ) : (
          transformedPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading featured places:", error);
    return (
      <div className="mt-3 text-center">
        <div className="text-muted-foreground text-sm">
          Unable to load featured places. Please check your connection and try
          again.
        </div>
        <div className="text-muted-foreground mt-1 text-xs">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }
}
