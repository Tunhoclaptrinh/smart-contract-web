import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError } from "@codecash/api-client";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("ApiClient refresh on 401", () => {
  it("renews the token once and repeats the request", async () => {
    let token = "old";
    const fetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
      new Headers(init?.headers).get("Authorization") === "Bearer new"
        ? json(200, { success: true, data: { ok: 1 } })
        : json(401, { code: "INVALID_SESSION" }),
    );
    const refresh = vi.fn(async () => (token = "new"));
    const client = new ApiClient({
      baseUrl: "/api/v1",
      getToken: () => token,
      refresh,
      fetch: fetch as typeof globalThis.fetch,
    });
    expect(await client.get("/x")).toEqual({ ok: 1 });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("shares one refresh between requests failing together", async () => {
    let token = "old";
    const fetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
      new Headers(init?.headers).get("Authorization") === "Bearer new"
        ? json(200, { success: true, data: 1 })
        : json(401, {}),
    );
    const refresh = vi.fn(
      () =>
        new Promise<string>((done) =>
          setTimeout(() => done((token = "new")), 10),
        ),
    );
    const client = new ApiClient({
      baseUrl: "",
      getToken: () => token,
      refresh,
      fetch: fetch as typeof globalThis.fetch,
    });
    await Promise.all([client.get("/a"), client.get("/b"), client.get("/c")]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("signs out when the refresh fails, and never refreshes a wrong password", async () => {
    const onUnauthorized = vi.fn();
    const refresh = vi.fn(async () => null);
    const client = new ApiClient({
      baseUrl: "",
      getToken: () => "t",
      refresh,
      onUnauthorized,
      fetch: (async () =>
        json(401, { code: "INVALID_SESSION" })) as typeof globalThis.fetch,
    });
    await expect(client.get("/x")).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    refresh.mockClear();
    onUnauthorized.mockClear();
    await expect(client.login("a@b.vn", "wrong")).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(refresh).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("keeps the field problems of an RFC 9457 answer", async () => {
    const client = new ApiClient({
      baseUrl: "",
      fetch: (async () =>
        json(400, {
          code: "REQUIRED:name",
          errors: [{ field: "name", code: "REQUIRED" }],
          traceId: "t-1",
        })) as typeof globalThis.fetch,
    });
    await expect(client.post("/x", {})).rejects.toMatchObject({
      code: "REQUIRED:name",
      requestId: "t-1",
      errors: [{ field: "name", code: "REQUIRED" }],
    });
  });
});
