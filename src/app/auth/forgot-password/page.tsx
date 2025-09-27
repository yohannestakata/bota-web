"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { notify } = useToast();
  const [sending, setSending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const captchaRef = useRef<HCaptcha | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      captchaToken,
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setSending(false);
    if (error) {
      notify("We couldn’t send the reset email. Try again.", "error");
      return;
    }
    notify("Check your inbox for a reset link.", "success");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Forgot password</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Enter your email and we’ll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold">Email</label>
          <input
            type="email"
            {...register("email")}
            className="border-border bg-background w-full border p-3 text-sm focus:outline-none"
          />
          {errors.email?.message ? (
            <div className="text-destructive mt-1 text-xs">
              {errors.email.message}
            </div>
          ) : null}
        </div>
        <HCaptcha
          ref={captchaRef}
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(undefined)}
          onError={() => setCaptchaToken(undefined)}
        />
        <button
          type="submit"
          disabled={sending || !captchaToken}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 text-sm font-semibold"
        >
          {sending ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
