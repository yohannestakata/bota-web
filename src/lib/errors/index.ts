import { getFriendlyAuthErrorMessage } from "./auth";

export { getFriendlyAuthErrorMessage };

export function getFriendlyErrorMessage(error: unknown): string {
  const raw = normalizeErrorMessage(error);

  // Route auth-ish errors through the auth mapper
  if (isLikelyAuthError(raw)) {
    return getFriendlyAuthErrorMessage(error);
  }

  // General error patterns → friendly messages
  const patterns: Array<
    | { match: RegExp; to: string }
    | { match: RegExp; to: (m: RegExpMatchArray) => string }
  > = [
    // Connectivity & network
    {
      match:
        /(Failed to fetch|NetworkError|ECONNREFUSED|ENOTFOUND|ERR_NETWORK)/i,
      to: "We’re having trouble connecting. Check your connection and try again.",
    },
    {
      match: /(timeout|ETIMEDOUT|network timeout)/i,
      to: "This is taking a little long—please try again.",
    },

    // HTTP-ish
    {
      match: /404|not found/i,
      to: "We couldn’t find what you’re looking for.",
    },
    { match: /403|forbidden/i, to: "You don’t have access to that." },
    { match: /401|unauthorized/i, to: "Please sign in to continue." },
    {
      match: /429|rate limit|too many requests/i,
      to: "You’ve tried a few times. Take a minute and try again.",
    },
    {
      match: /5\d{2}|internal server error/i,
      to: "Something went wrong on our end—please try again.",
    },

    // Parsing / data
    {
      match: /Unexpected token.*in JSON|JSON.parse/i,
      to: "We ran into a data hiccup. Please try again.",
    },

    // Validation vibes
    {
      match: /(required|cannot be null)/i,
      to: "Please fill out all required fields.",
    },
    { match: /(invalid|not valid)/i, to: "That doesn’t look quite right." },
    {
      match: /(too long|exceeds|maximum length)/i,
      to: "That value is a bit long—try shortening it.",
    },
    {
      match: /(too short|minimum length)/i,
      to: "That value is a bit short—try adding a little more.",
    },
    {
      match: /(already exists|duplicate key|unique constraint)/i,
      to: "Looks like that’s already taken.",
    },
  ];

  for (const rule of patterns) {
    const m = raw.match(rule.match);
    if (m) return typeof rule.to === "function" ? rule.to(m) : rule.to;
  }

  // Status-based generic fallbacks
  const status = getStatusCode(error);
  if (status === 401) return "Please sign in to continue.";
  if (status === 403) return "You don’t have access to that.";
  if (status === 404) return "We couldn’t find what you’re looking for.";
  if (status === 429)
    return "You’ve tried a few times. Take a minute and try again.";
  if (status && status >= 500)
    return "Something went wrong on our end—please try again.";

  return "Something went wrong—please try again.";
}

function isLikelyAuthError(message: string): boolean {
  return /auth|login|sign\s*in|sign\s*up|password|email.*confirm|captcha|token|session|unauthorized|forbidden|rate limit|reset/i.test(
    message,
  );
}

function normalizeErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const anyErr = error as { message?: string; error?: string };
    if (typeof anyErr.message === "string" && anyErr.message.trim())
      return anyErr.message;
    if (typeof anyErr.error === "string" && anyErr.error.trim())
      return anyErr.error;
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
