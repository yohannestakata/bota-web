import Link from "next/link";

export default function BranchNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-foreground text-4xl font-bold tracking-tight">
        Branch not found
      </h1>
      <p className="text-muted-foreground mt-4 text-lg">
        The branch you&apos;re looking for doesn&apos;t exist or has been
        removed.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center px-4 py-2 text-sm"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
