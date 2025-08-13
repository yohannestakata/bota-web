"use client";

import { useAuth } from "@/app/auth-context";
import { createReview, uploadReviewPhoto } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type MenuItemOption = { id: string; name: string };
type CategoryOption = { id: number; name: string };

export default function AddReviewForm({
  placeId,
  placeSlug,
  menuItems,
  categories,
}: {
  placeId: string;
  placeSlug: string;
  menuItems: MenuItemOption[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [body, setBody] = useState("");
  const [visitedAt, setVisitedAt] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local queue of files to upload with optional links
  type PendingFile = {
    file: File;
    id: string; // local id
    previewUrl: string;
    menuItemId?: string | null;
    photoCategoryId?: number | null;
    altText?: string;
  };
  const [files, setFiles] = useState<PendingFile[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(
        `/login?redirect=/reviews/add/${encodeURIComponent(placeSlug)}`,
      );
    }
  }, [isLoading, user, placeSlug, router]);

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || !list.length) return;
    addFiles(Array.from(list));
    // Reset input so the same file selection can be re-picked
    e.target.value = "";
  }

  function addFiles(incoming: File[]) {
    const next: PendingFile[] = incoming.map((f) => ({
      file: f,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(f),
      menuItemId: null,
      photoCategoryId: null,
      altText: "",
    }));
    setFiles((prev) => [...prev, ...next]);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const review = await createReview(
        placeId,
        rating,
        body.trim(),
        visitedAt ? new Date(visitedAt).toISOString().slice(0, 10) : null,
      );
      // Upload files sequentially to keep it simple
      for (const pf of files) {
        await uploadReviewPhoto(review.id, pf.file, {
          altText: pf.altText || undefined,
          photoCategoryId: pf.photoCategoryId ?? undefined,
          menuItemId: pf.menuItemId ?? undefined,
        });
      }
      router.replace(`/place/${placeSlug}#reviews`);
    } catch (err) {
      setError((err as Error)?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = useMemo(
    () => rating >= 1 && rating <= 5 && body.trim().length > 0,
    [rating, body],
  );

  if (!user) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4">
        <label className="text-sm">Rating</label>
        <input
          type="range"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
        <div className="text-sm">{rating} / 5</div>
      </div>

      <div>
        <label className="mb-1 block text-sm">When did you visit?</label>
        <input
          type="date"
          value={visitedAt}
          onChange={(e) => setVisitedAt(e.target.value)}
          className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Your review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Share your experience..."
          className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
        />
        {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm">
          Photos (drag and drop or pick)
        </label>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="border-border bg-muted/30 mb-2 rounded-lg border p-6 text-center"
        >
          <p>Drag and drop images here</p>
          <p className="text-muted-foreground text-sm">PNG, JPG up to ~5MB</p>
          <div className="mt-3">
            <button
              type="button"
              className="rounded-md border px-3 py-1 text-sm"
              onClick={() => inputRef.current?.click()}
            >
              Choose files
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {files.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {files.map((pf) => (
              <li key={pf.id} className="border-border rounded-lg border p-3">
                <div className="flex items-start gap-3">
                  <img
                    src={pf.previewUrl}
                    alt="preview"
                    className="h-20 w-28 rounded object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="mb-1 block text-xs">Alt text</label>
                      <input
                        type="text"
                        value={pf.altText || ""}
                        onChange={(e) =>
                          setFiles((prev) =>
                            prev.map((f) =>
                              f.id === pf.id
                                ? { ...f, altText: e.target.value }
                                : f,
                            ),
                          )
                        }
                        className="border-input bg-background w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs">
                          Relate to menu item
                        </label>
                        <select
                          value={pf.menuItemId || ""}
                          onChange={(e) =>
                            setFiles((prev) =>
                              prev.map((f) =>
                                f.id === pf.id
                                  ? { ...f, menuItemId: e.target.value || null }
                                  : f,
                              ),
                            )
                          }
                          className="border-input bg-background w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
                        >
                          <option value="">None</option>
                          {menuItems.map((mi) => (
                            <option key={mi.id} value={mi.id}>
                              {mi.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs">
                          Photo category
                        </label>
                        <select
                          value={pf.photoCategoryId ?? ""}
                          onChange={(e) =>
                            setFiles((prev) =>
                              prev.map((f) =>
                                f.id === pf.id
                                  ? {
                                      ...f,
                                      photoCategoryId: e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                    }
                                  : f,
                              ),
                            )
                          }
                          className="border-input bg-background w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
                        >
                          <option value="">None</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-destructive ml-2 rounded-md border px-2 py-1 text-xs"
                    onClick={() =>
                      setFiles((prev) => prev.filter((f) => f.id !== pf.id))
                    }
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="bg-primary text-primary-foreground rounded-md px-5 py-2 font-medium disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Post review"}
        </button>
        <button
          type="button"
          className="rounded-md border px-5 py-2"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
