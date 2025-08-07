import ReviewCard from "./review-card";

const recentReviews = [
  {
    id: 1,
    place: "The Golden Fork",
    category: "Restaurant",
    rating: 4.8,
    review:
      "Amazing food and great atmosphere! The pasta was perfectly cooked and the service was excellent. Highly recommend the truffle pasta.",
    user: "Sarah M.",
    date: "2 days ago",
    likes: 24,
    loves: 10,
    mehs: 5,
    dislikes: 3,
    comments: 8,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", // Restaurant
  },
  {
    id: 2,
    place: "Blue Moon Cafe",
    category: "Cafe",
    rating: 4.6,
    review:
      "Best coffee in the city! The baristas are super friendly and the pastries are to die for. Perfect spot for working remotely.",
    user: "Mike R.",
    date: "1 week ago",
    likes: 18,
    loves: 8,
    mehs: 3,
    dislikes: 2,
    comments: 5,
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80", // Cafe
  },
  {
    id: 3,
    place: "Urban Fitness Center",
    category: "Gym",
    rating: 4.9,
    review:
      "State-of-the-art equipment and amazing trainers. The classes are challenging but fun. Great community feel!",
    user: "Emma L.",
    date: "3 days ago",
    likes: 31,
    loves: 15,
    mehs: 6,
    dislikes: 4,
    comments: 12,
    image:
      "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=600&q=80", // Gym
  },
  {
    id: 4,
    place: "Serenity Spa",
    category: "Spa",
    rating: 4.7,
    review:
      "A truly relaxing experience! The massage therapists are professional and attentive. The ambiance is calming and the facilities are spotless.",
    user: "Liam T.",
    date: "5 days ago",
    likes: 15,
    loves: 8,
    mehs: 2,
    dislikes: 1,
    comments: 3,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", // Spa
  },
  {
    id: 5,
    place: "The Golden Fork",
    category: "Restaurant",
    rating: 4.8,
    review:
      "Amazing food and great atmosphere! The pasta was perfectly cooked and the service was excellent. Highly recommend the truffle pasta.",
    user: "Sarah M.",
    date: "2 days ago",
    likes: 24,
    loves: 10,
    mehs: 5,
    dislikes: 3,
    comments: 8,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", // Restaurant
  },
];

export default function RecentReviews() {
  return (
    <section className="container mx-auto px-24 py-8">
      <h2 className="text-foreground text-2xl font-medium">Recent Reviews</h2>

      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {recentReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
