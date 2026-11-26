import { ApiClient } from "@scw/api-client";

export const ACCESS_TOKEN_KEY = "scw.accessToken";

/**
 * Gets a new access token with the refresh token, which only the browser holds (httpOnly cookie
 * `sc_refresh`, sent to /api/v1/auth only). Null when the session is over.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) return null;
  const body = (await response.json()) as {
    data?: { accessToken?: string; token?: string };
  };
  const token = body.data?.accessToken ?? body.data?.token ?? null;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  return token;
}

/**
 * The client every screen uses. The access token is short-lived (15 minutes); when the API answers
 * 401 the client renews it once and repeats the request, so a user is signed out only when the
 * refresh token itself is no longer valid.
 */
export const platform = new ApiClient({
  baseUrl: "/api/v1",
  getToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  refresh: refreshAccessToken,
  onUnauthorized: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.dispatchEvent(new Event("scw:unauthorized"));
  },
});
