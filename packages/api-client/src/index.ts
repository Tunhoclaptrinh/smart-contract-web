import type { AuthResult, PageQuery, PageResult, Entity } from "@scw/contracts";
/** One field problem of an RFC 9457 answer (`errors[]`), e.g. `{ field: "admin.email", code: "INVALID_EMAIL" }`. */
export interface FieldIssue {
  field: string;
  code: string;
  row?: number;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
    /** Every field problem the API listed, so a form can mark all of them at once. */
    public errors: FieldIssue[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export interface ClientOptions {
  baseUrl: string;
  getToken?: () => string | null;
  /**
   * Called once when a request gets 401: gets a new access token (refresh token cookie) and
   * returns it, or null when the session is over. The request is then sent again once.
   */
  refresh?: () => Promise<string | null>;
  onUnauthorized?: () => void;
  fetch?: typeof fetch;
}
/** Requests whose 401 means "wrong credentials", not "session expired": never refreshed. */
const NO_REFRESH =
  /^\/auth\/(login|register|refresh|demo-login|reset-password|forgot-password|invitations\/accept)\b/;

export class ApiClient {
  /** One refresh at a time: requests failing together wait for the same new token. */
  private refreshing: Promise<string | null> | null = null;
  constructor(private readonly options: ClientOptions) {}
  private refreshOnce() {
    if (!this.options.refresh) return Promise.resolve(null);
    this.refreshing ??= this.options.refresh().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const send = () => {
      const headers = new Headers(init.headers);
      const token = this.options.getToken?.();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      if (init.body && !(init.body instanceof FormData))
        headers.set("Content-Type", "application/json");
      return (this.options.fetch ?? fetch)(`${this.options.baseUrl}${path}`, {
        credentials: "same-origin",
        ...init,
        headers,
      });
    };
    let response = await send();
    if (
      response.status === 401 &&
      !NO_REFRESH.test(path) &&
      this.options.refresh
    ) {
      const token = await this.refreshOnce().catch(() => null);
      if (token) response = await send();
    }
    const contentType = response.headers.get("content-type") ?? "";
    const body =
      response.status === 204
        ? null
        : contentType.includes("json")
          ? await response.json()
          : await response.text();
    if (!response.ok) {
      if (response.status === 401 && !NO_REFRESH.test(path))
        this.options.onUnauthorized?.();
      throw new ApiError(
        response.status,
        body?.code ?? "REQUEST_FAILED",
        Array.isArray(body?.message)
          ? body.message.join(", ")
          : (body?.message ?? response.statusText),
        body?.requestId ?? body?.traceId,
        Array.isArray(body?.errors) ? body.errors : [],
      );
    }
    return (
      body && typeof body === "object" && "success" in body && "data" in body
        ? body.data
        : body
    ) as T;
  }
  async download(path: string, init: RequestInit = {}): Promise<Blob> {
    const headers = new Headers(init.headers);
    const token = this.options.getToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await (this.options.fetch ?? fetch)(
      this.options.baseUrl + path,
      { ...init, headers },
    );
    if (!response.ok)
      throw new ApiError(
        response.status,
        "DOWNLOAD_FAILED",
        response.statusText,
      );
    return response.blob();
  }
  get<T>(path: string, signal?: AbortSignal) {
    return this.request<T>(path, { signal });
  }
  post<T>(path: string, data: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  patch<T>(path: string, data: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
  put<T>(path: string, data: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  /**
   * Reads a server-sent event stream with the session token in the header (EventSource cannot
   * send one). Calls `onEvent` per event until `signal` aborts; resolves when the stream ends, so
   * the caller decides when to reconnect. A 401 signs the user out like any other request.
   */
  async stream(
    path: string,
    onEvent: (event: { event: string; data: string }) => void,
    signal: AbortSignal,
  ): Promise<void> {
    const headers = new Headers({ Accept: "text/event-stream" });
    const token = this.options.getToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await (this.options.fetch ?? fetch)(
      this.options.baseUrl + path,
      { headers, signal },
    );
    if (!response.ok || !response.body) {
      if (response.status === 401) this.options.onUnauthorized?.();
      throw new ApiError(response.status, "STREAM_FAILED", response.statusText);
    }
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += value;
      let end: number;
      while ((end = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        let event = "message";
        const data: string[] = [];
        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:"))
            data.push(line.slice(5).trimStart());
        }
        if (data.length) onEvent({ event, data: data.join("\n") });
      }
    }
  }
  login(email: string, password: string) {
    return this.post<AuthResult>("/auth/login", { email, password });
  }
  resource<T extends Entity>(name: string) {
    return new ResourceClient<T>(this, name);
  }
}
export class ResourceClient<T extends Entity> {
  private readonly path: string;
  constructor(
    private client: ApiClient,
    name: string,
  ) {
    this.path = `/resources/${encodeURIComponent(name)}`;
  }
  list(params: PageQuery = {}, signal?: AbortSignal): Promise<PageResult<T>> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params))
      if (value !== undefined && value !== "")
        query.set(
          key,
          key === "filters" ? JSON.stringify(value) : String(value),
        );
    return this.client.get(`${this.path}?${query}`, signal);
  }
  get(id: string) {
    return this.client.get<T>(`${this.path}/${encodeURIComponent(id)}`);
  }
  create(data: Partial<T>) {
    return this.client.post<T>(this.path, data);
  }
  update(id: string, data: Partial<T>) {
    return this.client.patch<T>(`${this.path}/${encodeURIComponent(id)}`, data);
  }
  remove(id: string) {
    return this.client.delete<{ deleted: boolean }>(
      `${this.path}/${encodeURIComponent(id)}`,
    );
  }
  removeMany(ids: string[]) {
    return this.client.post<{ deleted: number }>(`${this.path}/bulk-delete`, {
      ids,
    });
  }
  import(items: Partial<T>[]) {
    return this.client.post<{ created: number }>(`${this.path}/import`, {
      items,
    });
  }
}
