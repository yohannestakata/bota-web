import { getFeaturedPlaces, getAllCategories } from "@/lib/supabase/queries";
import PlaceCard from "./place-card";

export default async function FeaturedPlacesList() {
  const [places, categories] = await Promise.all([
    getFeaturedPlaces(10),
    getAllCategories(),
  ]);

  // Transform the data to match the expected format
  const transformedPlaces = places.map((place) => {
    const category = categories.find((cat) => cat.id === place.category_id);

    return {
      id: parseInt(place.id.replace(/-/g, "").substring(0, 8), 16), // Convert UUID to number
      name: place.name,
      category: category?.name || "Restaurant",
      rating: place.average_rating || 0,
      reviewCount: place.review_count || 0,
      distance: "0.5 km", // TODO: Calculate distance from user location (needs user location)
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", // Placeholder
      tags: Array.isArray(place.tags) ? place.tags : ["Restaurant", "Food"], // Use actual tags from database
    };
  });

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
      {transformedPlaces.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
