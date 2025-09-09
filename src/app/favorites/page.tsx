import FavoritesGrid from "@/features/favorites/components/favorites-grid";

export default async function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-heading mb-6 text-4xl font-bold">Your favorites</h1>
      <FavoritesGrid />
    </div>
  );
}
