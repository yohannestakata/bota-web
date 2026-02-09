import type { Metadata } from "next";
import { Suspense } from "react";
import SettingsForm from "@/features/account/components/settings-form.client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your Bota account settings, profile, and preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountSettingsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold">Account settings</h1>
      <p className="mt-2 text-sm">
        Make your profile feel like you. Update your name, username, and photo.
      </p>
      <Suspense fallback={null}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
