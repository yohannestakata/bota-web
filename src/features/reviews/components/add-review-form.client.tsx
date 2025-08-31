"use client";

import { useAuth } from "@/app/auth-context";
import { createReview, uploadReviewPhoto } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarRating } from "./star-rating";
import AuthGate from "@/components/ui/auth-gate";
import { useAnalytics } from "@/hooks/use-analytics";
import { uploadImageToBucket } from "@/lib/supabase/storage";
import PhotoEditorDialog, {
  type PendingFile as PendingFileType,
} from "./photo-editor-dialog.client";

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
  const [activePhotoId, setActivePhoto] = useState<string | null>(null);
  const activePhoto = files.find((f) => f.id === activePhotoId) || null;

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
          <div className="grid grid-cols-3 gap-2 md:gap-2">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => inputRef.current?.click()}
              className="group bg-muted/30 hover:bg-muted aspect-portrait border-border relative grid cursor-pointer place-items-center overflow-hidden border-2 border-dotted"
            >
              <ImagePlus className="text-muted-foreground group-hover:text-foreground h-6 w-6" />
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onFileSelect}
                className="hidden"
              />
            </div>

            {files.map((pf) => (
              <div
                key={pf.id}
                className="group bg-muted aspect-portrait relative overflow-hidden"
              >
                <Image
                  src={pf.previewUrl}
                  alt="preview"
                  fill
                  sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/50 group-hover:flex">
                  <button
                    type="button"
                    onClick={() => setActivePhoto(pf.id)}
                    className="border-border bg-white/90 px-2 py-1 text-xs hover:bg-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((f) => f.id !== pf.id))
                    }
                    className="border-destructive text-destructive bg-white/90 px-2 py-1 text-xs hover:bg-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
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
          file={activePhoto as PendingFileType | null}
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
