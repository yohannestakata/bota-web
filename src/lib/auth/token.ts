export type DecodedAccessToken = {
  exp?: number;
  sub?: string;
  email?: string;
  [key: string]: unknown;
};

function base64UrlDecode(input: string): string {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4 === 2 ? "==" : input.length % 4 === 3 ? "=" : "";
  const str = atob(input + pad);
  try {
    // decode UTF-8
    return decodeURIComponent(
      str
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );
  } catch {
    return str;
  }
}

export function isAccessTokenValid(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const payload = JSON.parse(base64UrlDecode(parts[1])) as DecodedAccessToken;
    if (!payload || typeof payload !== "object") return false;
    if (!payload.exp) return true;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  } catch {
    return false;
  }
}
