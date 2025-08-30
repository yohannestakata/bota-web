"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type DialogSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl"
  | "10xl"
  | "full";

const sizeToMaxW: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  "8xl": "max-w-8xl",
  "9xl": "max-w-9xl",
  "10xl": "max-w-10xl",
  full: "max-w-[96vw]",
};

export function Dialog({
  open,
  onOpenChange,
  size = "md",
  children,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  size?: DialogSize;
  children: React.ReactNode;
}) {
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

  const maxW = sizeToMaxW[size] || sizeToMaxW.md;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      style={{
        zIndex: 9999,
      }}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`bg-background relative z-10 w-[96vw] ${maxW} border-border h-[80vh] border p-0 shadow-xl`}
      >
        {children}
      </div>
    </div>,
    containerRef.current,
  );
}
