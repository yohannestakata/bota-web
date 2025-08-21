"use client";

import { useState } from "react";
import { useAuth } from "@/app/auth-context";
import AuthGateDialog from "./auth-gate-dialog.client";

/**
 * AuthGate - A reusable component that protects content behind authentication
 *
 * Usage:
 * <AuthGate>
 *   <button onClick={handleProtectedAction}>Protected Action</button>
 * </AuthGate>
 *
 * When an unauthenticated user clicks on the wrapped content,
 * a sign-in dialog will appear instead of executing the action.
 */

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthenticated?: () => void;
  requireAuth?: boolean;
  title?: string;
  description?: string;
  redirectTo?: string;
}

export default function AuthGate({
  children,
  fallback,
  onUnauthenticated,
  requireAuth = true,
  title = "Sign in to continue",
  description = "You need an account to do that.",
  redirectTo,
}: AuthGateProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // If auth is not required or user is authenticated, render children
  if (!requireAuth || user) {
    return <>{children}</>;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Create a wrapper that shows auth dialog when clicked
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAuth(true);
    if (onUnauthenticated) {
      onUnauthenticated();
    }
  };

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
      <AuthGateDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        title={title}
        description={description}
        redirectTo={redirectTo}
      />
    </>
  );
}
