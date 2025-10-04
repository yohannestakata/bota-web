"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "warning";
type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  notify: (title: string, variant?: ToastVariant, description?: string) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      notify: (
        title: string,
        variant: ToastVariant = "info",
        description?: string,
      ) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, title, description, variant }]);
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
      },
      dismiss: (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed top-4 left-1/2 z-[10000] -translate-x-1/2">
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {toasts.map((t) => {
                const Icon =
                  t.variant === "error"
                    ? AlertCircle
                    : t.variant === "success"
                      ? CheckCircle2
                      : t.variant === "warning"
                        ? AlertTriangle
                        : Info;

                const variantStyles = {
                  success: {
                    accent: "bg-green-500",
                    iconBg: "bg-green-500",
                    titleColor: "text-green-600",
                    iconColor: "text-white",
                    bgColor: "bg-green-50",
                  },
                  error: {
                    accent: "bg-red-500",
                    iconBg: "bg-red-500",
                    titleColor: "text-red-600",
                    iconColor: "text-white",
                    bgColor: "bg-red-50",
                  },
                  warning: {
                    accent: "bg-orange-500",
                    iconBg: "bg-orange-500",
                    titleColor: "text-orange-600",
                    iconColor: "text-white",
                    bgColor: "bg-orange-50",
                  },
                  info: {
                    accent: "bg-blue-500",
                    iconBg: "bg-blue-500",
                    titleColor: "text-blue-600",
                    iconColor: "text-white",
                    bgColor: "bg-blue-50",
                  },
                };

                const styles = variantStyles[t.variant];

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 300, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 300, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`pointer-events-auto max-w-[400px] min-w-[320px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg ${styles.bgColor}`}
                  >
                    {/* Wavy left accent border */}
                    <div className={`h-full w-1 ${styles.accent} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                    </div>

                    <div className="flex items-center gap-3 p-4">
                      {/* Circular icon container */}
                      <div
                        className={`${styles.iconBg} flex-shrink-0 rounded-full p-2`}
                      >
                        <Icon className={`h-4 w-4 ${styles.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`text-sm font-semibold ${styles.titleColor} mb-0.5`}
                        >
                          {t.title}
                        </h4>
                        {t.description && (
                          <p className="text-sm leading-relaxed text-gray-600">
                            {t.description}
                          </p>
                        )}
                      </div>

                      {/* Close button */}
                      <button
                        onClick={() => value.dismiss(t.id)}
                        className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-gray-100"
                        aria-label="Close notification"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
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

  // Provide backward compatibility for the old API
  const notify = (
    titleOrMessage: string,
    variant?: ToastVariant,
    description?: string,
  ) => {
    // If description is provided, treat first param as title
    if (description !== undefined) {
      ctx.notify(titleOrMessage, variant, description);
    } else {
      // If no description, treat as old API where first param is the message
      // Create a generic title based on variant
      const title =
        variant === "error"
          ? "Error"
          : variant === "success"
            ? "Success"
            : variant === "warning"
              ? "Warning"
              : "Info";
      ctx.notify(title, variant, titleOrMessage);
    }
  };

  return {
    ...ctx,
    notify,
  };
}
