import type { Metadata } from "next";
import FavoritesGrid from "@/features/favorites/components/favorites-grid";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";

export const metadata: Metadata = {
  title: "Your Favorites",
  description:
    "View and manage your favorite restaurants, cafes, and places saved on Bota.",
  alternates: {
    canonical: `${baseUrl}/favorites`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-heading mb-6 text-4xl font-bold">Your favorites</h1>
      <FavoritesGrid />
    </div>
  );
}
