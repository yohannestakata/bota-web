"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

function PageViewTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname) {
      // Track page view with current path
      posthog.capture("$pageview", {
        $current_url: window.location.href,
        path: pathname,
        search: searchParams.toString(),
      });
    }
  }, [pathname, searchParams, posthog]);

  return null; // This component doesn't render anything
}

export default function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  );
}
