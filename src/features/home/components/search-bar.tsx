import { SearchIcon } from "lucide-react";

export default function SearchBar() {
  return (
    <form className="border-border focus-within:ring-offset-accent focus-within:ring-ring mx-auto mt-8 flex h-14 w-xl items-center rounded-full border bg-white shadow-lg duration-75 focus-within:ring-2 focus-within:ring-offset-2">
      <input
        type="search"
        aria-label="Search for restaurants, bars, cafes, etc."
        placeholder="Search for restaurants, bars, cafes, etc."
        className="h-full w-full rounded-full bg-transparent px-6 focus:outline-none"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground mr-2 size-fit rounded-full p-3"
      >
        <SearchIcon className="size-5" strokeWidth={3} />
      </button>
    </form>
  );
}
