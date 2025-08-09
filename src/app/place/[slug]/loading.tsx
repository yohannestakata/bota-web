export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-6">
      <div className="bg-muted h-4 w-48 rounded" />
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="bg-muted aspect-video w-full rounded-3xl" />
          <div className="bg-muted mt-4 h-7 w-64 rounded" />
          <div className="bg-muted mt-2 h-16 w-full rounded" />
        </div>
        <aside className="border-border rounded-3xl border p-4">
          <div className="bg-muted h-6 w-32 rounded" />
          <div className="mt-2 space-y-2">
            <div className="bg-muted h-4 w-56 rounded" />
            <div className="bg-muted h-4 w-40 rounded" />
            <div className="bg-muted h-4 w-28 rounded" />
          </div>
        </aside>
      </div>
      <div className="mt-8">
        <div className="bg-muted h-6 w-48 rounded" />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="bg-muted h-32 rounded-2xl" />
          <div className="bg-muted h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
