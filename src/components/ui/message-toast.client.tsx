"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export default function MessageToast({
  serverMessage,
}: {
  serverMessage?: string;
}) {
  const { notify } = useToast();

  useEffect(() => {
    // Prefer hash message if available, fallback to server-provided query param
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    let messageFromHash: string | undefined;
    if (hash && hash.startsWith("#")) {
      const params = new URLSearchParams(hash.slice(1));
      const raw = params.get("message") || undefined;
      if (raw) messageFromHash = decodeURIComponent(raw);
    }

    const message = messageFromHash || serverMessage;
    if (!message) return;

    notify(message, "success");

    // Clean URL: remove ?message= and #message= fragments without a reload
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("message");
      if (url.hash) {
        const hParams = new URLSearchParams(url.hash.replace(/^#/, ""));
        hParams.delete("message");
        const newHash = hParams.toString();
        url.hash = newHash ? `#${newHash}` : "";
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      // no-op
    }
  }, [serverMessage, notify]);

  return null;
}
