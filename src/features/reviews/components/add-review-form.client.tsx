"use client";

import { useAuth } from "@/app/auth-context";
import { createReview, uploadReviewPhoto } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";
import PhotoPickerGrid from "@/components/media/photo-picker-grid.client";
import { type PendingPhotoFile } from "@/components/media/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarRating } from "./star-rating";
import AuthGate from "@/components/ui/auth-gate";
import { useAnalytics } from "@/hooks/use-analytics";
import { uploadImageToBucket } from "@/lib/supabase/storage";
import PhotoEditorDialog from "./photo-editor-dialog.client";

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
  const { trackReviewSubmitted } = useAnalytics();

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
  type PendingFile = PendingPhotoFile;
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [activePhotoId, setActivePhoto] = useState<string | null>(null);
  const activePhoto = files.find((f) => f.id === activePhotoId) || null;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(
        `/login?redirect=/reviews/add/${encodeURIComponent(placeSlug)}`,
      );
    }
  }, [isLoading, user, placeSlug, router]);

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

      // Track review submission
      trackReviewSubmitted(
        { id: placeId, name: "", slug: placeSlug }, // We'll need to get place name
        {
          rating: values.rating,
          has_photos: files.length > 0,
          text_length: (values.body || "").length,
        },
      );

      for (const pf of files) {
        const ext = (pf.file.name.split(".").pop() || "jpg").toLowerCase();
        const safeName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const objectPath = `reviews/${review.id}/${safeName}`;
        const { dbPath } = await uploadImageToBucket({
          bucket: "images",
          objectPathWithinBucket: objectPath,
          file: pf.file,
          contentType: pf.file.type || "image/jpeg",
          upsert: true,
        });
        await uploadReviewPhoto({
          reviewId: review.id,
          filePath: dbPath,
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
      <form onSubmit={onSubmit}>
        {/* Rating */}
        <div className="mt-12">
          <div className="text-foreground text-xl font-semibold">
            Rate your experience
          </div>
          <div className="mt-3">
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

        {/* Date of visit */}
        <div className="mt-12 grid gap-2">
          <label className="block font-semibold">Date of visit</label>
          <input
            type="date"
            {...register("visitedAt")}
            className="border-input bg-background w-full border p-3 focus:outline-none"
          />
          {errors.visitedAt && (
            <p className="text-destructive mt-1 text-xs">
              {errors.visitedAt.message as string}
            </p>
          )}
        </div>

        {/* Review */}
        <div className="mt-12">
          <label className="mb-2 block font-semibold">
            Your review (optional)
          </label>
          <textarea
            rows={5}
            placeholder="Share your experience..."
            {...register("body")}
            className="border-input bg-background w-full border p-3 focus:outline-none"
          />
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>

        {/* Photos */}
        <div className="mt-12">
          <label className="mb-2 block font-semibold">Photos (optional)</label>
          <PhotoPickerGrid
            files={files}
            onAddFiles={addFiles}
            onEdit={(id) => setActivePhoto(id)}
            onRemove={(id) =>
              setFiles((prev) => prev.filter((f) => f.id !== id))
            }
            accept="image/*"
            multiple
          />
        </div>

        <div className="mt-12 flex items-center justify-end gap-3">
          <button
            type="button"
            className="border-border hover:bg-muted border px-4 py-3"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 font-medium disabled:opacity-60"
          >
            {submitting ? "Posting your review…" : "Post review"}
          </button>
        </div>
        <PhotoEditorDialog
          open={Boolean(activePhoto)}
          onOpenChange={(v) => !v && setActivePhoto(null)}
          file={activePhoto as PendingPhotoFile | null}
          menuItems={menuItems}
          categories={categories}
          onChange={(next) =>
            setFiles((prev) =>
              prev.map((f) => (f.id === next.id ? { ...f, ...next } : f)),
            )
          }
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
        />
      </form>
    </AuthGate>
  );
}
