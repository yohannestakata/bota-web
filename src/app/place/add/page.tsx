import AddPlaceForm from "@/features/place/components/add-place-form.client";
import { getAllCategories } from "@/lib/supabase/queries";

export default async function AddPlacePage() {
  const categories = await getAllCategories();
  const simplified = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-heading text-4xl font-bold">Add a place</h1>
      <p className="mt-2">Share a spot you love. We’ll help others find it.</p>
      <div className="mt-8">
        <AddPlaceForm categories={simplified} />
      </div>
    </div>
  );
}
