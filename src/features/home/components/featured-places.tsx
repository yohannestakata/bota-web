import PlaceCard from "./place-card";

const popularPlaces = [
  {
    id: 1,
    name: "Central Park Bistro",
    category: "Restaurant",
    rating: 4.7,
    reviewCount: 156,
    distance: "0.5 km",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    tags: ["Italian", "Fine Dining", "Outdoor Seating"],
  },
  {
    id: 2,
    name: "Starbucks Reserve",
    category: "Cafe",
    rating: 4.5,
    reviewCount: 89,
    distance: "1.2 km",
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80",
    tags: ["Coffee", "Premium", "WiFi"],
  },
  {
    id: 3,
    name: "Pulse Fitness Studio",
    category: "Fitness",
    rating: 4.8,
    reviewCount: 203,
    distance: "0.8 km",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", // changed image
    tags: ["24/7", "Personal Training", "Classes"],
  },
  {
    id: 4,
    name: "The Local Pub",
    category: "Bar",
    rating: 4.6,
    reviewCount: 134,
    distance: "1.5 km",
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80",
    tags: ["Craft Beer", "Live Music", "Food"],
  },
  {
    id: 5,
    name: "City Mall",
    category: "Shopping",
    rating: 4.4,
    reviewCount: 67,
    distance: "2.1 km",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    tags: ["Shopping", "Food Court", "Entertainment"],
  },
  {
    id: 6,
    name: "Artisan Bakery",
    category: "Bakery",
    rating: 4.9,
    reviewCount: 98,
    distance: "0.3 km",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    tags: ["Fresh Bread", "Pastries", "Organic"],
  },
  {
    id: 7,
    name: "Serenity Spa",
    category: "Health",
    rating: 4.7,
    reviewCount: 112,
    distance: "2.3 km",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    tags: ["Massage", "Wellness", "Relaxation"],
  },
  {
    id: 8,
    name: "Book Haven",
    category: "Education",
    rating: 4.8,
    reviewCount: 76,
    distance: "1.1 km",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
    tags: ["Books", "Study", "Events"],
  },
  {
    id: 9,
    name: "ArtSpace Gallery",
    category: "Arts",
    rating: 4.9,
    reviewCount: 54,
    distance: "0.9 km",
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    tags: ["Exhibitions", "Workshops", "Modern Art"],
  },
  {
    id: 10,
    name: "City Events Hall",
    category: "Events",
    rating: 4.6,
    reviewCount: 134,
    distance: "1.5 km",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    tags: ["Concerts", "Conferences", "Meetups"],
  },
];

export default function FeaturedPlaces() {
  return (
    <section className="container mx-auto px-24 py-8">
      <h2 className="text-foreground text-2xl font-medium">Featured Places</h2>

      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {popularPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}
