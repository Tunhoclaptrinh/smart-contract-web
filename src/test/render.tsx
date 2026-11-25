import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as StoreProvider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import type { Role } from "@codecash/contracts";
import type { User } from "@/shared/api/types";
import { SessionProvider } from "@/shared/auth/session";
import { signedIn } from "@/shared/state/sessionSlice";
import { createAppStore } from "@/shared/state/store";

/** A signed-in user for tests; override what the test is about. */
export function testUser(overrides: Partial<User> = {}): User {
  return {
    id: "u-owner",
    email: "owner@novaan.vn",
    displayName: "Nguyễn Văn An",
    role: "CONTRACT_OWNER" as Role,
    organizationId: "B010",
    roleChipOrganization: "Nova An Business JSC",
    partyId: "B010",
    title: "Giám đốc dự án",
    permissions: [],
    ...overrides,
  } as User;
}

/**
 * Renders with the app's providers: Redux store (signed in as `user`, or signed out with null),
 * TanStack Query, the session and a router at `path`.
 */
export function renderWithApp(
  ui: ReactElement,
  { user = testUser(), path = "/" }: { user?: User | null; path?: string } = {},
) {
  const store = createAppStore();
  if (user) store.dispatch(signedIn(user));
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StoreProvider store={store}>
      <QueryClientProvider client={client}>
        <SessionProvider>
          <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
        </SessionProvider>
      </QueryClientProvider>
    </StoreProvider>
  );
  return { store, ...render(ui, { wrapper }) };
}
