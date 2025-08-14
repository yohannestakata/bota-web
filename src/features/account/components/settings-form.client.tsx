"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/auth-context";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { getFriendlyAuthErrorMessage } from "@/lib/errors/auth";

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
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
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

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

  const deleteAccount = async (): Promise<boolean> => {
    const session = await supabase.auth.getSession();
    const access = session.data.session?.access_token;
    if (!access) return false;
    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${access}` },
    });
    if (!res.ok) return false;
    await supabase.auth.signOut();
    return true;
  };
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const onConfirmDelete = async () => {
    setConfirmBusy(true);
    try {
      const ok = await deleteAccount();
      if (ok) {
        notify("Your account was deleted.", "success");
        window.setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      } else {
        notify("Couldn’t delete your account.", "error");
      }
    } finally {
      setConfirmBusy(false);
      setConfirmOpen(false);
    }
  };

  const startAvatarUpload = () => fileInputRef.current?.click();

  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      setAvatarUploading(true);
      const folder = `uploads/avatars/${user.id}`;
      const sigRes = await fetch("/api/uploads/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const sig = (await sigRes.json()) as {
        timestamp: number;
        signature: string;
        apiKey: string;
        cloudName: string;
        folder: string;
      };
      if (!sigRes.ok) {
        notify("Upload not configured. Check server logs.", "error");
        return;
      }
      if (!sig.cloudName) {
        notify("Upload not configured. Try again later.", "error");
        return;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("timestamp", String(sig.timestamp));
      form.append("api_key", sig.apiKey);
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);
      const cloud =
        sig.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
        {
          method: "POST",
          body: form,
        },
      );
      const uploadJson = (await uploadRes.json()) as {
        secure_url: string;
        public_id: string;
      };
      if (!uploadRes.ok) {
        notify("Upload failed. Please try again.", "error");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: uploadJson.secure_url })
        .eq("id", user.id);
      if (!error) {
        setProfile((prev) =>
          prev ? { ...prev, avatar_url: uploadJson.secure_url } : prev,
        );
        // Optimistic update for nav/avatar consumers
        setAvatarUrl(uploadJson.secure_url);
        // Also store in auth metadata to resist provider refresh overwrite
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: uploadJson.secure_url },
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="flex items-center gap-4">
        <div className="bg-muted relative h-20 w-20 overflow-hidden rounded-full">
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
        </div>
        <div className="space-x-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm"
            onClick={startAvatarUpload}
            disabled={avatarUploading}
          >
            {avatarUploading ? "Uploading..." : "Change photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarSelected}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm">Full name</label>
        <input
          type="text"
          {...register("full_name")}
          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
        />
        {errors.full_name?.message ? (
          <div className="text-destructive mt-1 text-xs">
            {errors.full_name.message}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm">Username</label>
        <input
          type="text"
          {...register("username")}
          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
        />
        {errors.username?.message ? (
          <div className="text-destructive mt-1 text-xs">
            {errors.username.message}
          </div>
        ) : null}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <hr className="border-border" />

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={Boolean(authProvider) && authProvider !== "email"}
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={updateEmail}
              disabled={
                emailUpdating ||
                (Boolean(authProvider) && authProvider !== "email")
              }
              className="rounded-md border px-3 py-2 text-sm"
            >
              {emailUpdating ? "Updating..." : "Update"}
            </button>
          </div>
          {authProvider && authProvider !== "email" ? (
            <p className="text-muted-foreground mt-1 text-xs">
              Email is managed by your {authProvider} account.
            </p>
          ) : (
            <p className="text-muted-foreground mt-1 text-xs">
              We’ll send a confirmation link to verify changes.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm">New password</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={updatePassword}
              disabled={passwordUpdating || newPassword.length < 6}
              className="rounded-md border px-3 py-2 text-sm"
            >
              {passwordUpdating ? "Updating..." : "Update"}
            </button>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Use at least 6 characters.
          </p>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <div className="mb-2 text-sm font-medium">Danger zone</div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="text-destructive rounded-md border px-3 py-2 text-sm"
        >
          Delete my account
        </button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete your account?"
        description="This will permanently remove your account and all associated data. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={onConfirmDelete}
        destructive
        confirmLoading={confirmBusy}
      />
    </form>
  );
}
