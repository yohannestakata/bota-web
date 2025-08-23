import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="text-foreground text-3xl font-semibold">
        Place not found
      </div>
      <p className="text-muted-foreground mt-2">
        We couldn’t find that place. It may have been removed or the URL is
        incorrect.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center px-4 py-2 text-sm"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
