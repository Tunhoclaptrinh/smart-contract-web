import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithApp, testUser } from "@/test/render";
import { Can, hasPermissions, withPermission } from "./Can";

const reader = testUser({ permissions: ["users:read"] });

describe("hasPermissions", () => {
  it("needs every permission by default and one with mode any", () => {
    expect(hasPermissions(["a", "b"], ["a", "b"])).toBe(true);
    expect(hasPermissions(["a"], ["a", "b"])).toBe(false);
    expect(hasPermissions(["a"], ["a", "b"], "any")).toBe(true);
    expect(hasPermissions([], "a")).toBe(false);
  });
});

describe("Can", () => {
  it("shows its children only to users holding the permission", () => {
    renderWithApp(
      <>
        <Can permission="users:read">may read</Can>
        <Can permission="users:create" fallback={<span>no create</span>}>
          may create
        </Can>
      </>,
      { user: reader },
    );
    expect(screen.getByText("may read")).toBeInTheDocument();
    expect(screen.queryByText("may create")).not.toBeInTheDocument();
    expect(screen.getByText("no create")).toBeInTheDocument();
  });

  it("passes whether the user is allowed to a render function", () => {
    renderWithApp(
      <Can permission="users:create">
        {(allowed) => <button disabled={!allowed}>Tạo</button>}
      </Can>,
      { user: reader },
    );
    expect(screen.getByRole("button", { name: "Tạo" })).toBeDisabled();
  });

  it("allows nothing when nobody is signed in", () => {
    renderWithApp(<Can permission="users:read">hidden</Can>, { user: null });
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });
});

describe("withPermission", () => {
  const Secret = ({ label }: { label: string }) => <p>{label}</p>;
  const Guarded = withPermission(Secret, "permissions:read");

  it("renders the wrapped screen with its props for an allowed user", () => {
    renderWithApp(<Guarded label="ma trận" />, {
      user: testUser({ permissions: ["permissions:read"] }),
    });
    expect(screen.getByText("ma trận")).toBeInTheDocument();
    expect(Guarded.displayName).toBe("withPermission(Secret)");
  });

  it("shows the forbidden page otherwise", () => {
    renderWithApp(<Guarded label="ma trận" />, { user: reader });
    expect(screen.queryByText("ma trận")).not.toBeInTheDocument();
    expect(
      screen.getByText("Bạn không có quyền mở màn này"),
    ).toBeInTheDocument();
  });
});
