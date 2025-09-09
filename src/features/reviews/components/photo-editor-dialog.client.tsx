"use client";

import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import { type PendingPhotoFile } from "@/components/media/types";

export default function PhotoEditorDialog({
  open,
  onOpenChange,
  file,
  menuItems,
  categories,
  onChange,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  file: PendingPhotoFile | null;
  menuItems: { id: string; name: string }[];
  categories: { id: number; name: string }[];
  onChange: (next: PendingPhotoFile) => void;
  onRemove: (id: string) => void;
}) {
  if (!file) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="3xl">
      <div className="grid h-full grid-cols-12 gap-4 md:p-6">
        <div className="col-span-12 md:col-span-7">
          <div className="bg-muted relative aspect-video h-full w-full">
            <Image
              src={file.previewUrl}
              alt={file.altText || "preview"}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="space-y-6">
            <div className="sticky top-0">
              <h2 className="text-xl font-bold">Edit photo</h2>
            </div>
            <div>
              <label className="mb-1 block font-semibold">Alt text</label>
              <input
                type="text"
                value={file.altText || ""}
                onChange={(e) => onChange({ ...file, altText: e.target.value })}
                className="border-input bg-background w-full border p-3 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold">
                Relate to menu item
              </label>
              <select
                value={file.menuItemId || ""}
                onChange={(e) =>
                  onChange({ ...file, menuItemId: e.target.value || null })
                }
                className="border-input bg-background w-full border p-3 focus:outline-none"
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
              <label className="mb-1 block font-semibold">Photo category</label>
              <select
                value={file.photoCategoryId ?? ""}
                onChange={(e) =>
                  onChange({
                    ...file,
                    photoCategoryId: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="border-input bg-background w-full border p-3 focus:outline-none"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="border-border hover:bg-muted border px-4 py-3"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="border-border bg-primary text-primary-foreground hover:bg-primary/90 border px-4 py-3"
                onClick={() => {
                  onOpenChange(false);
                  onChange(file);
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
