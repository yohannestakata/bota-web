"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/auth-context";
import { supabase } from "@/lib/supabase/client";
import { uploadImageToBucket } from "@/lib/supabase/storage";
import { useToast } from "@/components/ui/toast";
import { getFriendlyAuthErrorMessage } from "@/lib/errors/auth";
import { Upload } from "lucide-react";

const schema = z.object({
  full_name: z.string().max(120).optional().or(z.literal("")),
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(32)
    .regex(/^[a-z0-9_]+$/i, "Letters, numbers, and underscores only"),
});

type FormValues = z.infer<typeof schema>;

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default function SettingsForm() {
  const { user, setAvatarUrl } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setAvatarUploading] = useState(false);
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | undefined>(
    undefined,
  );
  const { notify } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Username availability check
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const watchedUsername = watch("username");
  useEffect(() => {
    let cancelled = false;
    const value = (watchedUsername || "").trim();
    if (!value) {
      setUsernameAvailable(null);
      return;
    }
    // If unchanged from current profile, treat as available
    if (value === (profile?.username || "")) {
      setUsernameAvailable(true);
      return;
    }
    setUsernameChecking(true);
    const t = window.setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", value)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          setUsernameAvailable(null);
        } else {
          const takenByOther = Boolean(
            (data as { id?: string } | null)?.id &&
              (data as { id?: string } | null)?.id !== user?.id,
          );
          setUsernameAvailable(!takenByOther);
        }
      } finally {
        if (!cancelled) setUsernameChecking(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [watchedUsername, profile?.username, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) {
        setProfile(data as Profile);
        reset({
          full_name: data.full_name || "",
          username: data.username || "",
        });
      }
      setLoading(false);
    })();
    // Load auth provider for capabilities
    (async () => {
      const res = await supabase.auth.getUser();
      if (!mounted) return;
      const provider = (res.data.user?.app_metadata as { provider?: string })
        ?.provider;
      setAuthProvider(provider);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id, reset]);

  const avatarUrl = profile?.avatar_url ?? user?.avatarUrl ?? null;

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: values.username,
        full_name: values.full_name || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (!error) {
      // Also push to auth metadata to reduce future overwrites from providers
      try {
        await supabase.auth.updateUser({
          data: {
            username: values.username,
            full_name: values.full_name || undefined,
          },
        });
      } catch {}
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              username: values.username,
              full_name: values.full_name || null,
            }
          : prev,
      );
      notify("Profile updated", "success");
    } else {
      notify("Couldn’t save your changes. Please try again.", "error");
    }
  };

  const [email, setEmail] = useState<string>("");
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const updateEmail = async () => {
    if (!email) return;
    setEmailUpdating(true);
    const { error } = await supabase.auth.updateUser({ email });
    setEmailUpdating(false);
    if (error)
      notify(
        getFriendlyAuthErrorMessage(error) || "Email update failed",
        "error",
      );
    else notify("Check your inbox to confirm your new email.", "success");
  };

  const [newPassword, setNewPassword] = useState("");
  const updatePassword = async () => {
    if (!newPassword) return;
    setPasswordUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordUpdating(false);
    if (error)
      notify(
        getFriendlyAuthErrorMessage(error) || "Password update failed",
        "error",
      );
    else notify("Password updated.", "success");
  };

  const startAvatarUpload = () => fileInputRef.current?.click();

  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      setAvatarUploading(true);
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeName =
        `${Date.now()}-${Math.random().toString(36).slice(2)}` + `.${ext}`;
      const objectPath = `avatars/${user.id}/${safeName}`;
      const { publicUrl } = await uploadImageToBucket({
        bucket: "images",
        objectPathWithinBucket: objectPath,
        file,
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (!error) {
        setProfile((prev) =>
          prev ? { ...prev, avatar_url: publicUrl } : prev,
        );
        // Optimistic update for nav/avatar consumers
        setAvatarUrl(publicUrl);
        // Also store in auth metadata to resist provider refresh overwrite
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: publicUrl },
          });
        } catch {}
        notify("Photo updated", "success");
      } else {
        notify("Upload failed. Please try again.", "error");
      }
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="py-12">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={startAvatarUpload}
            className="group bg-muted relative h-20 w-20 overflow-hidden rounded-full"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm">
                {profile?.full_name?.charAt(0) ?? "U"}
              </div>
            )}
            <div className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
              <span className="text-xs text-white">
                <Upload />
              </span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarSelected}
          />
        </div>

        {/* Name and username in same section */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold">Full name</label>
              <input
                type="text"
                {...register("full_name")}
                className="border-border bg-background w-full border p-3 text-sm focus:outline-none"
              />
              {errors.full_name?.message ? (
                <div className="text-destructive mt-1 text-xs">
                  {errors.full_name.message}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-base font-semibold">Username</label>
              <input
                type="text"
                {...register("username")}
                className="border-border bg-background w-full border p-3 text-sm focus:outline-none"
              />
              <div className="min-h-4 text-xs">
                {usernameChecking ? (
                  <span className="text-muted-foreground">Checking...</span>
                ) : usernameAvailable === true ? (
                  <span className="text-green-700">Available</span>
                ) : usernameAvailable === false ? (
                  <span className="text-destructive">Already taken</span>
                ) : null}
              </div>
              {errors.username?.message ? (
                <div className="text-destructive mt-1 text-xs">
                  {errors.username.message}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !isDirty}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 px-4 py-3 text-sm font-semibold disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <hr className="border-border" />

      <div className="space-y-6 py-12">
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold">Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={Boolean(authProvider) && authProvider !== "email"}
              className="border-border bg-background w-full border p-3 text-sm focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={updateEmail}
              disabled={
                emailUpdating ||
                (Boolean(authProvider) && authProvider !== "email")
              }
              className="border-border border px-4 py-3 text-sm disabled:opacity-40"
            >
              {emailUpdating ? "Updating..." : "Update"}
            </button>
          </div>
          {authProvider && authProvider !== "email" ? (
            <p className="mt-1 text-sm">
              Email is managed by your {authProvider} account.
            </p>
          ) : (
            <p className="mt-1 text-sm">
              We’ll send a confirmation link to verify changes.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold">New password</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-border bg-background w-full border p-3 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={updatePassword}
              disabled={passwordUpdating || newPassword.length < 6}
              className="border-border border px-4 py-3 text-sm disabled:opacity-40"
            >
              {passwordUpdating ? "Updating..." : "Update"}
            </button>
          </div>
          <p className="mt-1 text-sm">Use at least 6 characters.</p>
        </div>
      </div>

      <hr className="border-border" />

      <div className="py-12">
        <div className="mb-4 text-lg font-semibold">Danger zone</div>
        <Link
          href="/account/delete"
          className="text-destructive border-border border px-4 py-3 text-sm"
        >
          Delete my account
        </Link>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          className="border-border ml-3 border px-4 py-3 text-sm"
        >
          Sign out
        </button>
      </div>
    </form>
  );
}
