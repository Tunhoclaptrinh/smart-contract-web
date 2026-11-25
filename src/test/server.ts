import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

/** The API every test talks to (MSW). A test adds the answers it needs with `server.use(...)`. */
export const server = setupServer();

/** The API's success envelope, as the real backend sends it. */
export const ok = <T>(data: T, init?: ResponseInit) =>
  HttpResponse.json({ success: true, data }, init);

/** The API's error body: status plus the business code the UI translates. */
export const fail = (status: number, code: string) =>
  HttpResponse.json({ statusCode: status, code, message: code }, { status });

export { http };
