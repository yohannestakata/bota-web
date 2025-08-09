import {
  CategoriesSection,
  RecentReviews,
  FeaturedPlaces,
  Header,
  Footer,
} from "@/features/home";

export default function Home() {
  return (
    <div>
      <Header />
      <RecentReviews />
      <CategoriesSection />
      <FeaturedPlaces />
      <Footer />
    </div>
  );
}

// Revalidate this route every hour to align with featured view refresh cadence
export const revalidate = 3600;
