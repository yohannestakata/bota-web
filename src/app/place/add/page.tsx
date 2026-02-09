import type { Metadata } from "next";
import AddPlaceForm from "@/features/place/components/add-place-form.client";
import { getAllCategories } from "@/lib/supabase/queries";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";

export const metadata: Metadata = {
  title: "Add a Place",
  description:
    "Add a new restaurant, cafe, or business to Bota. Help others discover great places in Ethiopia.",
  alternates: {
    canonical: `${baseUrl}/place/add`,
  },
  openGraph: {
    title: "Add a Place | Bota",
    description:
      "Submit a new restaurant, cafe, or business listing to Bota.",
    url: `${baseUrl}/place/add`,
    type: "website",
  },
};

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
