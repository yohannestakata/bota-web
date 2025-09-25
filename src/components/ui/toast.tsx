"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";
type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  notify: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      notify: (message: string, variant: ToastVariant = "info") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, variant }]);
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed top-22 left-1/2 z-[10000] -translate-x-1/2 transform">
          <div className="flex flex-col items-center gap-2">
            <AnimatePresence initial={false}>
              {toasts.map((t) => {
                const Icon =
                  t.variant === "error"
                    ? AlertCircle
                    : t.variant === "success"
                      ? CheckCircle2
                      : Info;
                const borderClass =
                  t.variant === "error"
                    ? "border-destructive"
                    : t.variant === "success"
                      ? "border-green-600"
                      : "border-border";
                const textClass =
                  t.variant === "error"
                    ? "text-destructive"
                    : t.variant === "success"
                      ? "text-green-700"
                      : "text-foreground";
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: -12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`bg-background pointer-events-auto border ${borderClass} ${textClass} rounded-md px-4 py-3 text-sm font-semibold shadow-lg`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="mt-[1px] h-4 w-4 opacity-90" />
                      <span>{t.message}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
