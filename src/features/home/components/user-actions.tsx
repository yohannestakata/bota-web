"use client";

import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Image from "next/image";

export default function UserActions() {
  const { user, signOut, isLoading } = useAuth();
  return (
    <ul className="flex items-center gap-6">
      {isLoading ? null : user ? (
        <li className="flex items-center">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label="User menu"
                className="hover:ring-foreground/20 focus:ring-foreground/30 inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-1 ring-transparent transition focus:ring-2 focus:outline-none"
              >
                <Image
                  src={user.avatarUrl || "/vercel.svg"}
                  alt={user.email || "User"}
                  width={36}
                  height={36}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="bg-popover text-popover-foreground border-border/60 z-50 min-w-48 border p-1 shadow-md"
            >
              <div className="px-2 py-2 text-sm font-medium">
                {user.email ?? user.id}
              </div>
              <DropdownMenu.Separator className="bg-border/60 my-1 h-px" />
              <DropdownMenu.Item asChild>
                <Link
                  href="/favorites"
                  className="hover:bg-accent hover:text-accent-foreground px-2 py-2 text-sm"
                >
                  Favorites
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="bg-border/60 my-1 h-px" />
              <DropdownMenu.Item asChild>
                <Link
                  href="/account"
                  className="hover:bg-accent hover:text-accent-foreground px-2 py-2 text-sm"
                >
                  Account settings
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="bg-border/60 my-1 h-px" />
              <DropdownMenu.Item asChild>
                <button
                  onClick={() => void signOut()}
                  className="hover:bg-accent hover:text-accent-foreground w-full px-2 py-2 text-left text-sm"
                >
                  Sign out
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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
