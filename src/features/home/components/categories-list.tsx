import { getCategories } from "@/lib/supabase/queries";
import * as Icons from "lucide-react";
import Link from "next/link";

export default async function CategoriesList() {
  const categories = await getCategories();

  // Transform the data to match the expected format
  const transformedCategories = categories.map((category) => {
    const iconKey = (category.icon_name || "") as keyof typeof Icons;
    const Icon = Icons[iconKey] as (props: {
      className?: string;
      strokeWidth?: number;
    }) => React.JSX.Element;
    return {
      name: category.name,
      icon: Icon || null,
      href: `/category/${category.slug}`,
      description: category.description,
    };
  });

  return (
    <div className="mt-5 grid grid-cols-2 gap-10 md:grid-cols-5">
      {transformedCategories.map((category) => (
        <Link key={category.name} href={category.href} className="group">
          <div className="flex items-center gap-4">
            <div>
              {category.icon ? (
                <category.icon className="mx-auto h-8 w-8" strokeWidth={1.75} />
              ) : (
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-sm font-semibold underline-offset-4 group-hover:underline">
                    {category.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-foreground mt-1 underline-offset-4 group-hover:underline">
              {category.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
