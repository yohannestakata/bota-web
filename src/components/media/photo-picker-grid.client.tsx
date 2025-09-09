"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";

type PhotoItem = { id: string; previewUrl: string };

type PhotoPickerGridProps<T extends PhotoItem> = {
  files: T[];
  onAddFiles: (files: File[]) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
};

export default function PhotoPickerGrid<T extends PhotoItem>({
  files,
  onAddFiles,
  onEdit,
  onRemove,
  accept = "image/*",
  multiple = true,
  className = "",
}: PhotoPickerGridProps<T>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || !list.length) return;
    onAddFiles(Array.from(list));
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    onAddFiles(Array.from(e.dataTransfer.files));
  }
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-2 md:gap-2">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          className="group bg-muted/30 hover:bg-muted aspect-portrait border-border relative grid cursor-pointer place-items-center overflow-hidden border-2 border-dotted"
        >
          <ImagePlus className="text-muted-foreground group-hover:text-foreground h-6 w-6" />
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={onFileSelect}
            className="hidden"
          />
        </div>
        {files.map((pf) => (
          <div
            key={pf.id}
            onClick={() => onEdit(pf.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEdit(pf.id);
              }
            }}
            role="button"
            tabIndex={0}
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
                onClick={() => onEdit(pf.id)}
                className="border-border bg-white/90 px-2 py-1 text-xs hover:bg-white"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(pf.id);
                }}
                className="border-destructive text-destructive bg-white/90 px-2 py-1 text-xs hover:bg-white"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
