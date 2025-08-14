"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import { uploadPlacePhoto } from "@/lib/supabase/queries";

type MenuItemOption = { id: string; name: string };
type CategoryOption = { id: number; name: string };

type PendingFile = {
  file: File;
  id: string;
  previewUrl: string;
  menuItemId?: string | null;
  photoCategoryId?: number | null;
  altText?: string;
};

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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(
        `/login?redirect=/place/${encodeURIComponent(placeSlug)}/photos/add`,
      );
    }
  }, [isLoading, user, placeSlug, router]);

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || !list.length) return;
    addFiles(Array.from(list));
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    addFiles(Array.from(e.dataTransfer.files));
  }
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!files.length) {
      notify("Please add at least one file.", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      for (const pf of files) {
        await uploadPlacePhoto(placeId, pf.file, {
          altText: pf.altText || undefined,
          photoCategoryId: pf.photoCategoryId ?? undefined,
          menuItemId: pf.menuItemId ?? undefined,
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

  if (!user) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm">Upload type</label>
        <div className="text-muted-foreground text-xs">
          Photos supported today. Video coming soon.
        </div>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border-border mb-2 rounded-lg border-2 border-dotted p-6 text-center"
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

      {error ? <div className="text-destructive text-sm">{error}</div> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || files.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm disabled:opacity-60"
        >
          {isSubmitting ? "Uploading..." : "Upload"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
