import { Brand, NavigationMenu, UserActions } from ".";
import SearchBar from "@/components/search-bar";

export default function Header() {
  return (
    <header className="bg-muted border-border border-b px-12 py-8">
      <nav className="relative container mx-auto flex items-center justify-between">
        <Brand />
        <NavigationMenu />
        <UserActions />
      </nav>

      <SearchBar />
    </header>
  );
}
