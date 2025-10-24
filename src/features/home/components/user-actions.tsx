"use client";

import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import Image from "next/image";

export default function UserActions() {
  const { user, isLoading } = useAuth();
  const initials = (() => {
    const src = user?.email || user?.id || "U";
    const namePart = (src || "U").split("@")[0];
    const letters = namePart
      .replace(/[^a-zA-Z]/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const first = letters[0]?.charAt(0).toUpperCase() || "U";
    const second = letters[1]?.charAt(0).toUpperCase() || "";
    return `${first}${second}`;
  })();
  return (
    <ul className="flex items-center gap-6">
      {isLoading ? null : user ? (
        <li className="flex items-center">
          <Link
            href="/account"
            aria-label="Account"
            className="hover:ring-foreground/20 focus:ring-foreground/30 border-border inline-flex size-10 items-center justify-center overflow-hidden rounded-full border ring-1 ring-transparent transition focus:ring-2 focus:outline-none"
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.email || "User"}
                width={36}
                height={36}
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <div className="bg-muted text-foreground/80 border-border grid size-10 place-items-center rounded-full border text-sm font-semibold">
                {initials}
              </div>
            )}
          </Link>
        </li>
      ) : (
        <>
          <li>
            <Link
              href="/login"
              className="text-foreground text-sm font-medium hover:underline"
            >
              Sign in
            </Link>
          </li>
          <li>
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
            >
              Sign up
            </Link>
          </li>
        </>
      )}
    </ul>
  );
}
