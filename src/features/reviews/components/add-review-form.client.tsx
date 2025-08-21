"use client";

import { useAuth } from "@/app/auth-context";
import { createReview, uploadReviewPhoto } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarRating } from "./star-rating";
import AuthGate from "@/components/ui/auth-gate";

type MenuItemOption = { id: string; name: string };
type CategoryOption = { id: number; name: string };

export default function AddReviewForm({
  placeId,
  placeSlug,
  menuItems,
  categories,
}: {
  placeId: string; // This is now actually the branch ID
  placeSlug: string;
  menuItems: MenuItemOption[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const schema = z.object({
    rating: z.number().min(1).max(5),
    visitedAt: z.string().min(1),
    body: z.string().max(2000).optional().or(z.literal("")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, visitedAt: today, body: "" },
  });

  const rating = watch("rating");
  // Access values to avoid unused warnings when not referenced elsewhere
  watch("visitedAt");
  watch("body");

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

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return; // AuthGate will handle this
    setSubmitting(true);
    setError(null);
    try {
      const review = await createReview({
        branchId: placeId,
        rating: values.rating,
        body: (values.body || "").trim(),
        visitedAt: values.visitedAt
          ? new Date(values.visitedAt).toISOString().slice(0, 10)
          : undefined,
      });
      for (const pf of files) {
        // TODO: Upload file to Cloudinary first to get filePath
        // For now, using a placeholder to fix TypeScript error
        await uploadReviewPhoto({
          reviewId: review.id,
          filePath: `placeholder/${pf.file.name}`,
          altText: pf.altText || undefined,
          photoCategoryId: pf.photoCategoryId ?? undefined,
        });
      }
      router.replace(`/place/${placeSlug}#reviews`);
    } catch (err) {
      setError((err as Error)?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthGate
      title="Sign in to add a review"
      description="You need an account to share your experience."
    >
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-6">
          <div>
            <div className="text-sm font-medium">Rate your experience</div>
            <div className="mt-2">
              <StarRating
                value={rating}
                onChange={(v) => setValue("rating", v)}
              />
            </div>
            {errors.rating && (
              <p className="text-destructive mt-1 text-xs">
                {errors.rating.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Last visit</label>
            <input
              type="date"
              {...register("visitedAt")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            />
            {errors.visitedAt && (
              <p className="text-destructive mt-1 text-xs">
                {errors.visitedAt.message as string}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Tell us more (optional)</label>
          <textarea
            rows={5}
            placeholder="Share your experience..."
            {...register("body")}
            className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
          />
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm">Photos (optional)</label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-border mb-2 rounded-lg border-2 border-dotted p-6 text-center"
          >
            <p>Drag and drop photos</p>
            <p className="text-muted-foreground text-sm">
              PNG or JPG up to ~5MB
            </p>
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
                <li key={pf.id} className="rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative h-20 w-28 overflow-hidden rounded">
                      <Image
                        src={pf.previewUrl}
                        alt="preview"
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
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
                                    ? {
                                        ...f,
                                        menuItemId: e.target.value || null,
                                      }
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
            disabled={submitting}
            className="bg-primary text-primary-foreground rounded-md px-5 py-2 font-medium disabled:opacity-60"
          >
            {submitting ? "Posting your review…" : "Post review"}
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
    </AuthGate>
  );
}
