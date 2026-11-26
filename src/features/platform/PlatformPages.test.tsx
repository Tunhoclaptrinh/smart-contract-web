import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithApp, testUser } from "@/test/render";
import { fail, http, ok, server } from "@/test/server";
import ResourcePage from "./ResourcePage";
import PermissionMatrixPage from "./PermissionMatrixPage";

const definitions = [
  {
    name: "organizations",
    fields: [
      { key: "name", type: "string", required: true, label: "Tên tổ chức" },
      { key: "code", type: "string", required: true, label: "Mã" },
      {
        key: "kind",
        type: "select",
        options: ["BUYER", "SUPPLIER"],
        label: "Loại",
      },
    ],
  },
  {
    name: "users",
    fields: [
      { key: "displayName", type: "string", required: true, label: "Họ tên" },
      { key: "email", type: "email", required: true, label: "Email" },
      {
        key: "role",
        type: "select",
        options: ["CONTRACT_OWNER", "SUPPLIER", "ORG_ADMIN"],
        label: "Vai trò",
      },
      { key: "active", type: "boolean", label: "Hoạt động" },
    ],
  },
  { name: "settings", fields: [{ key: "name", type: "string", label: "Tên" }] },
];
const page = (items: unknown[]) => ({
  items,
  total: items.length,
  page: 1,
  limit: 20,
  totalPages: 1,
});
const admin = testUser({
  id: "u-admin",
  role: "ORG_ADMIN",
  organizationId: "B010",
  permissions: [
    "users:read",
    "users:create",
    "users:update",
    "organizations:read",
  ],
});

function api(users: unknown[] = []) {
  server.use(
    http.get("*/api/v1/resources", () => ok(definitions)),
    http.get("*/api/v1/resources/users", () => ok(page(users))),
    http.get("*/api/v1/resources/organizations", () =>
      ok(
        page([
          {
            id: "B010",
            name: "Nova An",
            code: "B010",
            kind: "BUYER",
            version: 1,
          },
        ]),
      ),
    ),
  );
}
const usersPage = (user = admin) =>
  renderWithApp(
    <Routes>
      <Route path="/platform/:resource?" element={<ResourcePage />} />
      <Route path="/account/invite" element={<p>trang mời</p>} />
    </Routes>,
    { user, path: "/platform/users" },
  );

describe("platform: accounts", () => {
  it("lists the accounts the API returns", async () => {
    api([
      {
        id: "u1",
        displayName: "Nguyễn Văn An",
        email: "an@novaan.vn",
        role: "CONTRACT_OWNER",
        active: true,
        version: 1,
        organizationId: "B010",
      },
    ]);
    usersPage();
    expect(await screen.findAllByText("an@novaan.vn")).not.toHaveLength(0);
  });

  it("an administrator invites a member from the account list", async () => {
    api();
    usersPage();
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("invite-member"));
    expect(await screen.findByText("trang mời")).toBeInTheDocument();
  });

  it("no invitation button without users:create", async () => {
    api();
    usersPage(testUser({ role: "AUDITOR", permissions: ["users:read"] }));
    await screen.findAllByRole("tab");
    expect(screen.queryByTestId("invite-member")).toBeNull();
  });

  it("shows the reason when the list cannot load", async () => {
    server.use(
      http.get("*/api/v1/resources", () => ok(definitions)),
      http.get("*/api/v1/resources/users", () =>
        fail(503, "UPSTREAM_UNAVAILABLE"),
      ),
      http.get("*/api/v1/resources/organizations", () => ok(page([]))),
    );
    usersPage();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows only the tabs of resources the role may read", async () => {
    api();
    usersPage();
    const tabs = await screen.findAllByRole("tab");
    const names = tabs.map((tab) => tab.textContent ?? "");
    expect(names.some((n) => /người dùng|users/i.test(n))).toBe(true);
    expect(names.some((n) => /cấu hình|settings/i.test(n))).toBe(false);
  });
});

describe("platform: permission matrix", () => {
  it("shows each permission with the roles that hold it", async () => {
    server.use(
      http.get("*/api/v1/permissions", () =>
        ok({
          roles: ["ORG_ADMIN", "AUDITOR"],
          modules: [
            {
              key: "users",
              permissions: [
                { key: "users:create", grants: { ORG_ADMIN: "org" } },
              ],
            },
          ],
        }),
      ),
      http.get("*/api/v1/resources/users", () => ok(page([]))),
    );
    renderWithApp(<PermissionMatrixPage />, {
      user: testUser({
        role: "SYSTEM_ADMIN",
        permissions: ["permissions:read"],
      }),
    });
    expect(await screen.findAllByText("Tạo người dùng")).not.toHaveLength(0);
    expect(screen.getAllByText("Quản trị công ty")).not.toHaveLength(0);
  });
});
