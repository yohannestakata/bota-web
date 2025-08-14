import AddPlaceForm from "@/features/place/components/add-place-form.client";
import { getAllCategories } from "@/lib/supabase/queries";

export default async function AddPlacePage() {
  const categories = await getAllCategories();
  const simplified = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Add a place</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Share a spot you love. We’ll help others find it.
      </p>
      <AddPlaceForm categories={simplified} />
    </div>
  );
}
