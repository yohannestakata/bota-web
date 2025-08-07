import {
  Coffee,
  Utensils,
  Wine,
  Car,
  ShoppingBag,
  Camera,
  Dumbbell,
  Palette,
  Heart,
  Book,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    name: "Restaurants",
    icon: Utensils,
    href: "/category/restaurants",
  },
  {
    name: "Cafes",
    icon: Coffee,
    href: "/category/cafes",
  },
  {
    name: "Bars",
    icon: Wine,
    href: "/category/bars",
  },
  {
    name: "Transport",
    icon: Car,
    href: "/category/transport",
  },
  {
    name: "Shopping",
    icon: ShoppingBag,
    href: "/category/shopping",
  },
  {
    name: "Entertainment",
    icon: Camera,
    href: "/category/entertainment",
  },
  {
    name: "Fitness",
    icon: Dumbbell,
    href: "/category/fitness",
  },
  {
    name: "Arts",
    icon: Palette,
    href: "/category/arts",
  },
  {
    name: "Health",
    icon: Heart,
    href: "/category/health",
  },
  {
    name: "Education",
    icon: Book,
    href: "/category/education",
  },
  {
    name: "Events",
    icon: Calendar,
    href: "/category/events",
  },
  {
    name: "Other",
    icon: MoreHorizontal,
    href: "/category/other",
  },
];

export default function CategoriesSection() {
  return (
    <section className="container mx-auto px-24 py-8">
      <h2 className="text-foreground text-2xl font-medium">
        Explore by Category
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="border-border rounded-3xl border p-6"
          >
            <div className="text-center">
              <div>
                <category.icon className="mx-auto h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-foreground mt-1">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
