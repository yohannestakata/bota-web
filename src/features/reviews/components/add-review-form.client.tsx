"use client";

import { useAuth } from "@/app/auth-context";
import {
  createReview,
  updateReview,
  uploadReviewPhoto,
  deleteReviewPhoto,
} from "@/lib/supabase/queries";
import { normalizeImageSrc } from "@/lib/utils/images";
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
import { useToast } from "@/components/ui/toast";

type MenuItemOption = { id: string; name: string };
type CategoryOption = { id: number; name: string };

export default function AddReviewForm({
  placeId,
  placeSlug,
  branchSlug,
  menuItems,
  categories,
  initialReview,
}: {
  placeId: string; // This is now actually the branch ID
  placeSlug: string; // Parent place slug
  branchSlug: string; // Branch slug for routing
  menuItems: MenuItemOption[];
  categories: CategoryOption[];
  initialReview?: {
    id: string;
    rating: number;
    body?: string;
    visitedAt?: string;
    photos?: Array<{ id: string; file_path: string; alt_text?: string | null }>;
  };
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackReviewSubmitted } = useAnalytics();
  const { notify } = useToast();

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
    defaultValues: {
      rating: initialReview?.rating ?? 5,
      visitedAt: initialReview?.visitedAt?.slice(0, 10) ?? today,
      body: initialReview?.body ?? "",
    },
  });

  const rating = watch("rating");
  // Access values to avoid unused warnings when not referenced elsewhere
  watch("visitedAt");
  watch("body");

  // Local queue of files to upload with optional links
  type ExistingPhoto = {
    id: string;
    previewUrl: string;
    isExisting: true;
  };
  type PendingFile = PendingPhotoFile | ExistingPhoto;
  const [files, setFiles] = useState<PendingFile[]>(
    (initialReview?.photos || []).map((p) => ({
      id: p.id,
      previewUrl: normalizeExistingPreview(p.file_path),
      isExisting: true,
    })) as PendingFile[],
  );
  if (process.env.NODE_ENV !== "production") {
    console.log("[add-review-form] initialReview", {
      hasInitial: !!initialReview,
      photoCount: initialReview?.photos?.length || 0,
    });
  }
  const [activePhotoId, setActivePhoto] = useState<string | null>(null);
  const activePhoto = files.find((f) => f.id === activePhotoId) || null;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(
        `/login?redirect=/reviews/add/${encodeURIComponent(branchSlug)}`,
      );
    }
  }, [isLoading, user, branchSlug, router]);

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

  function normalizeExistingPreview(filePath: string): string {
    return normalizeImageSrc(filePath);
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return; // AuthGate will handle this
    setSubmitting(true);
    setError(null);
    try {
      const effectiveVisited = values.visitedAt
        ? new Date(values.visitedAt).toISOString().slice(0, 10)
        : undefined;
      const review = initialReview
        ? await updateReview({
            reviewId: initialReview.id,
            rating: values.rating,
            body: (values.body || "").trim(),
            visitedAt: effectiveVisited,
          })
        : await createReview({
            branchId: placeId,
            rating: values.rating,
            body: (values.body || "").trim(),
            visitedAt: effectiveVisited,
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

      // Sync photos: delete removed existing, upload new ones
      const existingIds = new Set(
        (initialReview?.photos || []).map((p) => String(p.id)),
      );
      const keptExistingIds = new Set(
        files
          .filter(
            (f): f is ExistingPhoto =>
              "isExisting" in f && (f as ExistingPhoto).isExisting === true,
          )
          .map((f) => f.id),
      );
      // Delete removed existing photos
      for (const id of Array.from(existingIds)) {
        if (!keptExistingIds.has(id)) {
          await deleteReviewPhoto({ photoId: id, reviewId: review.id });
        }
      }
      // Upload new photos
      for (const pf of files) {
        // Only upload newly added files; existing photos are skipped
        if ("isExisting" in pf) continue;
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
      // Success: show toast and go back to the specific branch page
      notify(
        initialReview ? "Your review was updated." : "Thanks for your review!",
        "success",
      );
      const to = branchSlug
        ? `/place/${placeSlug}/${branchSlug}#reviews`
        : `/place/${placeSlug}#reviews`;
      router.replace(to);
    } catch (err) {
      const anyErr = err as { code?: string; message?: string };
      const msg = (anyErr?.message || "").toLowerCase();
      if (
        anyErr?.code === "23505" ||
        /duplicate key/.test(msg) ||
        /already exists/.test(msg) ||
        /unique/.test(msg)
      ) {
        setError(
          "Looks like you already reviewed this place. You can update your existing review instead.",
        );
      } else {
        setError("We couldn’t post your review right now. Please try again.");
      }
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

        <div className="mt-12 flex items-center gap-3">
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
