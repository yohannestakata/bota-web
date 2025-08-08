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
