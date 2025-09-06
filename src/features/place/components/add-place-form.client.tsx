"use client";

import { useAuth } from "@/app/auth-context";
import AuthGate from "@/components/ui/auth-gate";
import PlaceForm from "./forms/place-form.client";

export default function AddPlaceForm({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) {
    return <div className="text-sm">Please sign in to add a place.</div>;
  }

  return (
    <AuthGate
      title="Sign in to add a place"
      description="You need an account to add new places to our directory."
    >
      <div>
        <PlaceForm categories={categories} />
      </div>
    </AuthGate>
  );
}
