"use client";

import { Flame, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterMenu({
  items = [
    { key: "recent", label: "Recent" },
    { key: "trending", label: "Trending" },
    { key: "nearby", label: "Nearby" },
  ],
  active,
}: {
  items?: { key?: string; label: string }[];
  active?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const iconFor = (key?: string) => {
    if (key === "recent") return <Clock className="size-5" strokeWidth={2} />;
    if (key === "trending") return <Flame className="size-5" strokeWidth={2} />;
    if (key === "nearby") return <MapPin className="size-5" strokeWidth={2} />;
    return null;
  };

  // Default to recent
  const activeKey = active ?? "recent";
  const hrefFor = (key?: string) => {
    if (key === "recent") return "/";
    return `/?filter=${encodeURIComponent(key || "")}`;
  };

  function onNearbyClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const lat = sp.get("lat");
    const lon = sp.get("lon");
    if (lat && lon) {
      router.push(`/?filter=nearby&lat=${lat}&lon=${lon}`);
      return;
    }
    if (!navigator.geolocation) {
      router.push("/");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        router.push(`/?filter=nearby&lat=${latitude}&lon=${longitude}`);
      },
      () => router.push("/"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <ul className="flex items-center justify-center gap-6">
      {items.map(({ key, label }) => {
        const isActive = (activeKey ?? undefined) === (key ?? undefined);
        const href = hrefFor(key);
        return (
          <li key={key ?? "all"}>
            <Link
              href={href}
              onClick={key === "nearby" ? onNearbyClick : undefined}
              className={`flex items-center gap-2 font-medium ${
                isActive && "underline decoration-2 underline-offset-8"
              }`}
            >
              {iconFor(key)}
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
