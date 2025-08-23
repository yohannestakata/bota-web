import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "https://botareview.com/relay-dlLN",
  ui_host: "https://us.posthog.com",
  defaults: "2025-05-24",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  disable_session_recording: process.env.NODE_ENV === "development",
});
