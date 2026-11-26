import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import i18n from "@/i18n";
import { server } from "./server";

// antd's responsive helpers ask for matchMedia, which jsdom does not provide.
if (!window.matchMedia)
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

// Tables and virtual lists measure their container; jsdom has no layout, so the observer is a no-op.
if (!("ResizeObserver" in globalThis))
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

// Numbers and dates format in Vietnamese, as in the product.
await i18n.changeLanguage("vi");

// Every request goes to the MSW server; one nobody answered fails the test.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  // The app calls relative URLs (/api/v1/...); Node's fetch needs them absolute.
  const fetchWithBase = globalThis.fetch;
  globalThis.fetch = (input, init) =>
    fetchWithBase(
      typeof input === "string" && input.startsWith("/")
        ? new URL(input, window.location.origin).href
        : input,
      init,
    );
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
