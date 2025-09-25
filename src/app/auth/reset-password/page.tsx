"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

const schema = z
  .object({
    password: z.string().min(6, "Use at least 6 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { notify } = useToast();
  const [ready, setReady] = useState(false);
  const [hasRecovery, setHasRecovery] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // When loaded with a recovery hash, set the session so password update is permitted
  useEffect(() => {
    (async () => {
      try {
        const hash = window.location.hash;
        if (!hash) {
          setReady(true);
          setHasRecovery(false);
          return;
        }
        const params = new URLSearchParams(hash.slice(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const type = params.get("type");
        if (type === "recovery" && access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          setHasRecovery(true);
        } else {
          setHasRecovery(false);
        }
      } catch {
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (error) {
      notify("Couldn’t reset password. Please try again.", "error");
      return;
    }
    notify("Password updated.", "success");
    window.setTimeout(() => {
      window.location.href = "/account";
    }, 900);
  };

  if (!ready) return null;

  if (!hasRecovery) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Reset password</h1>
        <p className="text-muted-foreground text-sm">
          This link is invalid or expired. Please request a new password reset.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Reset password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold">New password</label>
          <input
            type="password"
            {...register("password")}
            className="border-border bg-background w-full border p-3 text-sm focus:outline-none"
          />
          {errors.password?.message ? (
            <div className="text-destructive mt-1 text-xs">
              {errors.password.message}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold">Confirm password</label>
          <input
            type="password"
            {...register("confirm")}
            className="border-border bg-background w-full border p-3 text-sm focus:outline-none"
          />
          {errors.confirm?.message ? (
            <div className="text-destructive mt-1 text-xs">
              {errors.confirm.message}
            </div>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 text-sm font-semibold"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
