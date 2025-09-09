"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import { uploadPlacePhoto } from "@/lib/supabase/queries";
import AuthGate from "@/components/ui/auth-gate";
import { uploadImageToBucket } from "@/lib/supabase/storage";
import PhotoEditorDialog from "@/features/reviews/components/photo-editor-dialog.client";
import PhotoPickerGrid from "@/components/media/photo-picker-grid.client";
import { type PendingPhotoFile } from "@/components/media/types";

type MenuItemOption = { id: string; name: string };
type CategoryOption = { id: number; name: string };

type PendingFile = PendingPhotoFile;

export default function PlacePhotoUpload({
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
  const { user, isLoading } = useAuth();
  const { notify } = useToast();
  const router = useRouter();
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoId, setActivePhoto] = useState<string | null>(null);
  const activePhoto = files.find((f) => f.id === activePhotoId) || null;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(
        `/login?redirect=/place/${encodeURIComponent(placeSlug)}/photos/add`,
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return; // AuthGate will handle this
    if (!files.length) {
      notify("Please add at least one file.", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      for (const pf of files) {
        const ext = (pf.file.name.split(".").pop() || "jpg").toLowerCase();
        const safeName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const objectPath = `places/${placeId}/${safeName}`;
        const { dbPath } = await uploadImageToBucket({
          bucket: "images",
          objectPathWithinBucket: objectPath,
          file: pf.file,
          contentType: pf.file.type || "image/jpeg",
          upsert: true,
        });
        await uploadPlacePhoto({
          branchId: placeId,
          filePath: dbPath,
          altText: pf.altText || undefined,
          photoCategoryId: pf.photoCategoryId ?? undefined,
        });
      }
      notify("Upload complete. Thanks for sharing!", "success");
      router.replace(`/place/${placeSlug}#photos`);
    } catch (err) {
      setError((err as Error)?.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthGate
      title="Sign in to upload photos"
      description="You need an account to share photos."
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <PhotoPickerGrid
          className="mt-4"
          files={files}
          onAddFiles={addFiles}
          onEdit={(id) => setActivePhoto(id)}
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          accept="image/*"
          multiple
        />

        {error ? <div className="text-destructive text-sm">{error}</div> : null}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="border-border hover:bg-muted border p-3 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || files.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/80 p-3 font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Uploading..." : "Upload"}
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
