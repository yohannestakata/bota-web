"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { AuthProvider } from "./auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      </QueryClientProvider>
    </PostHogProvider>
  );
}
