import { Brand, NavigationMenu, UserActions } from ".";
import SearchBar from "@/components/search-bar";

export default function Header() {
  return (
    <header>
      <div className="relative container mx-auto mt-6 flex max-w-6xl items-center justify-between px-4">
        <Brand />
        <NavigationMenu />
        <UserActions />
      </div>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <h1 className="text-center text-4xl font-semibold tracking-tight md:text-6xl">
          Discover the best places
        </h1>
        <div className="mx-auto mt-5 w-full max-w-3xl">
          <SearchBar />
        </div>
      </section>
    </header>
  );
}
