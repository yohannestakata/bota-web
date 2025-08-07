import {
  CategoriesSection,
  FeaturedReviews,
  PopularPlaces,
  Header,
  Footer,
} from "@/features/home";

export default function Home() {
  return (
    <div>
      <Header />
      <FeaturedReviews />
      <CategoriesSection />
      <PopularPlaces />
      <Footer />
    </div>
  );
}
