export function getFriendlyAuthErrorMessage(error: unknown): string {
  const rawMessage = normalizeErrorMessage(error);

  // Known auth error patterns → friendly messages
  const patterns: Array<
    | { match: RegExp; to: string }
    | { match: RegExp; to: (m: RegExpMatchArray) => string }
  > = [
    {
      match: /Password should be at least\s+(\d+)/i,
      to: (m) =>
        `That password looks a little short—try at least ${m[1]} characters.`,
    },
    {
      match:
        /password.*(weak|requirement|lower|upper|digit|symbol)|lower_upper_letters_digits_symbols/i,
      to: "Make your password stronger with letters, numbers, and a symbol.",
    },
    {
      match:
        /User already registered|email.*already.*registered|already exists/i,
      to: "Looks like you already have an account with that email. Try signing in.",
    },
    {
      match: /Invalid login credentials|invalid email or password/i,
      to: "That email or password doesn’t look right.",
    },
    {
      match: /Email not confirmed|email.*not.*confirmed|confirm your email/i,
      to: "Please confirm your email to keep going—check your inbox for our link.",
    },
    {
      match: /Signups are disabled|signup.*disabled|signups not allowed/i,
      to: "Signups are paused right now.",
    },
    {
      match: /Captcha verification failed|invalid captcha|captcha.*failed/i,
      to: "Captcha didn’t go through—give it another try.",
    },
    {
      match: /Over email rate limit|too many requests|rate limit/i,
      to: "You’ve tried a few times. Take a minute and try again.",
    },
    {
      match: /token.*expired|expired session|jwt expired/i,
      to: "Your session timed out—please sign in again.",
    },
    {
      match: /Reset password token|Invalid or expired/i,
      to: "That reset link has expired. Request a new one.",
    },
  ];

  for (const rule of patterns) {
    const match = rawMessage.match(rule.match);
    if (match) {
      return typeof rule.to === "function" ? rule.to(match) : rule.to;
    }
  }

  // Generic fallbacks by status if available
  const status = getStatusCode(error);
  if (status === 401 || /unauthorized|forbidden/i.test(rawMessage)) {
    return "Please sign in to continue.";
  }
  if (status === 422 && /password/i.test(rawMessage)) {
    return "Let’s make that password stronger.";
  }

  return "Something went wrong—please try again.";
}

function normalizeErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const anyErr = error as { message?: string; error?: string };
    if (typeof anyErr.message === "string" && anyErr.message.trim()) {
      return anyErr.message;
    }
    if (typeof anyErr.error === "string" && anyErr.error.trim()) {
      return anyErr.error;
    }
  }
  return "Unknown error";
}

function getStatusCode(error: unknown): number | undefined {
  if (error && typeof error === "object") {
    const anyErr = error as { status?: number };
    if (typeof anyErr.status === "number") return anyErr.status;
  }
  return undefined;
}
