import { getCategories } from "@/lib/supabase/queries";
import Link from "next/link";

export default async function CategoriesList() {
  const categories = await getCategories();

  // Transform the data to match the expected format
  const transformedCategories = categories.map((category) => ({
    name: category.name,
    icon: null, // We'll use the first letter instead
    href: `/category/${category.slug}`,
    description: category.description,
  }));

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-6">
      {transformedCategories.map((category) => (
        <Link
          key={category.name}
          href={category.href}
          className="border-border rounded-3xl border p-6"
        >
          <div className="text-center">
            <div>
              {category.icon ? (
                <category.icon className="mx-auto h-8 w-8" strokeWidth={1.5} />
              ) : (
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-sm font-semibold text-gray-600">
                    {category.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-foreground mt-1">{category.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

