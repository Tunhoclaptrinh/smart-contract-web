import { describe, expect, it, vi } from "vitest";
import type { User } from "../api/types";
import { restoreSession, signedIn, signedOut } from "./sessionSlice";
import { createAppStore } from "./store";

const getUser = vi.hoisted(() => vi.fn());
vi.mock("../api/auth.api", () => ({ getUser }));

const user = {
  id: "u-owner",
  email: "owner@novaan.vn",
  displayName: "Nguyễn Văn An",
  role: "CONTRACT_OWNER",
  organizationId: "B010",
  roleChipOrganization: "Nova An Business JSC",
  partyId: "B010",
  title: "Giám đốc dự án",
  permissions: ["organizations:read"],
} as User;

describe("session slice", () => {
  it("signs in and out", () => {
    const store = createAppStore();
    store.dispatch(signedIn(user));
    expect(store.getState().session).toEqual({ user, restoring: false });
    store.dispatch(signedOut());
    expect(store.getState().session.user).toBeNull();
  });

  it("starts restoring when a session is stored and ends with the API's answer", async () => {
    const store = createAppStore({ restoring: true });
    expect(store.getState().session.restoring).toBe(true);
    getUser.mockResolvedValueOnce(user);
    await store.dispatch(restoreSession("u-owner"));
    expect(store.getState().session).toEqual({ user, restoring: false });
  });

  it("ends signed out when the stored token is no longer valid", async () => {
    const store = createAppStore({ restoring: true });
    getUser.mockResolvedValueOnce(null);
    await store.dispatch(restoreSession("u-owner"));
    expect(store.getState().session).toEqual({ user: null, restoring: false });
    getUser.mockRejectedValueOnce(new Error("offline"));
    await store.dispatch(restoreSession("u-owner"));
    expect(store.getState().session.restoring).toBe(false);
  });
});
