"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  destructive?: boolean;
  confirmLoading?: boolean;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  destructive,
  confirmLoading,
}: ConfirmDialogProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      containerRef.current = document.body as unknown as HTMLElement;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open || !containerRef.current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div className="bg-background relative z-10 w-[90vw] max-w-md rounded-2xl border p-6 shadow-xl">
        <div className="mb-2 text-lg font-semibold">{title}</div>
        {description ? (
          <p className="text-muted-foreground mb-4 text-sm">{description}</p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border px-3 py-2 text-sm"
            disabled={!!confirmLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!!confirmLoading}
            className={`rounded-md px-3 py-2 text-sm ${
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {confirmLoading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    containerRef.current,
  );
}
