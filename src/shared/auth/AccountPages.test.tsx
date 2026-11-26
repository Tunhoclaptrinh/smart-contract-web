import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithApp, testUser } from "@/test/render";
import { fail, http, ok, server } from "@/test/server";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import AcceptInvitationPage from "./AcceptInvitationPage";
import ChangePasswordPage from "./ChangePasswordPage";
import { assignableRoles } from "./InviteMemberPage";

const PASSWORD = "MotMatKhauDai2026!";
const typeNewPassword = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByTestId("new-password"), PASSWORD);
  await user.type(screen.getByTestId("confirm-password"), PASSWORD);
};

describe("roles an inviter may hand out", () => {
  it("follows SoD: a company administrator only its company's business roles", () => {
    expect(assignableRoles("ORG_ADMIN", "SUPPLIER")).toEqual(["SUPPLIER"]);
    expect(assignableRoles("ORG_ADMIN", "BUYER")).not.toContain("AUDITOR");
    expect(assignableRoles("SYSTEM_ADMIN")).toContain("AUDITOR");
    expect(assignableRoles("CONTRACT_OWNER", "BUYER")).toEqual([]);
  });
});

describe("forgotten password", () => {
  it("confirms the same way whatever the email", async () => {
    let sent: unknown;
    server.use(
      http.post("*/api/v1/auth/forgot-password", async ({ request }) => {
        sent = await request.json();
        return ok({ accepted: true }, { status: 202 });
      }),
    );
    renderWithApp(<ForgotPasswordPage />, { user: null });
    const user = userEvent.setup();
    await user.type(screen.getByTestId("forgot-email"), "an@novaan.vn");
    await user.click(screen.getByTestId("forgot-submit"));
    expect(await screen.findByTestId("forgot-sent")).toBeInTheDocument();
    expect(sent).toEqual({ email: "an@novaan.vn" });
  });

  it("explains a rate limit", async () => {
    server.use(
      http.post("*/api/v1/auth/forgot-password", () =>
        fail(429, "TOO_MANY_REQUESTS"),
      ),
    );
    renderWithApp(<ForgotPasswordPage />, { user: null });
    const user = userEvent.setup();
    await user.type(screen.getByTestId("forgot-email"), "an@novaan.vn");
    await user.click(screen.getByTestId("forgot-submit"));
    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      "quá nhanh",
    );
  });
});

describe("password reset link", () => {
  const page = (path: string) =>
    renderWithApp(
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>,
      { user: null, path },
    );

  it("sets the new password with the code of the link", async () => {
    let sent: unknown;
    server.use(
      http.post("*/api/v1/auth/reset-password", async ({ request }) => {
        sent = await request.json();
        return ok({ reset: true, email: "an@novaan.vn" });
      }),
    );
    page("/reset-password?token=abc");
    const user = userEvent.setup();
    await typeNewPassword(user);
    await user.click(screen.getByTestId("reset-submit"));
    expect(await screen.findByTestId("reset-done")).toBeInTheDocument();
    expect(sent).toEqual({ token: "abc", newPassword: PASSWORD });
  });

  it("says when the link was used or expired, and when it has no code", async () => {
    server.use(
      http.post("*/api/v1/auth/reset-password", () =>
        fail(400, "INVALID_OR_EXPIRED_TOKEN"),
      ),
    );
    page("/reset-password?token=old");
    const user = userEvent.setup();
    await typeNewPassword(user);
    await user.click(screen.getByTestId("reset-submit"));
    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      "không còn hiệu lực",
    );
  });

  it("refuses a password shorter than 12 characters before calling the API", async () => {
    page("/reset-password?token=abc");
    const user = userEvent.setup();
    await user.type(screen.getByTestId("new-password"), "short");
    await user.click(screen.getByTestId("reset-submit"));
    expect(
      await screen.findByText("Mật khẩu cần 12–128 ký tự."),
    ).toBeInTheDocument();
  });
});

describe("invitation link", () => {
  const page = () =>
    renderWithApp(
      <Routes>
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        <Route path="/home" element={<p>trang chủ</p>} />
      </Routes>,
      { user: null, path: "/accept-invitation?token=inv-1" },
    );

  it("shows the invitation, activates the account and signs in", async () => {
    server.use(
      http.get("*/api/v1/auth/invitations/inv-1", () =>
        ok({
          email: "chu.hd@novaan.vn",
          displayName: "Chủ hợp đồng",
          role: "CONTRACT_OWNER",
          organization: "Nova An Business JSC",
          expiresAt: "2026-12-04T00:00:00Z",
        }),
      ),
      http.post("*/api/v1/auth/invitations/accept", () =>
        ok({
          token: "t-inv",
          accessToken: "t-inv",
          user: testUser({ id: "u-new" }),
        }),
      ),
    );
    page();
    expect(await screen.findByText("Nova An Business JSC")).toBeInTheDocument();
    const user = userEvent.setup();
    await typeNewPassword(user);
    await user.click(screen.getByTestId("accept-submit"));
    expect(await screen.findByText("trang chủ")).toBeInTheDocument();
    expect(localStorage.getItem("codecash.accessToken")).toBe("t-inv");
  });

  it("says when the invitation is no longer valid", async () => {
    server.use(
      http.get("*/api/v1/auth/invitations/inv-1", () =>
        fail(404, "INVITATION_NOT_FOUND"),
      ),
    );
    page();
    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      "Lời mời không còn hiệu lực",
    );
  });
});

describe("change password", () => {
  it("shows the API's reason when the current password is wrong", async () => {
    server.use(
      http.post("*/api/v1/auth/password", () =>
        fail(400, "CURRENT_PASSWORD_INCORRECT"),
      ),
    );
    renderWithApp(<ChangePasswordPage />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId("current-password"), "khong-dung-dau");
    await typeNewPassword(user);
    await user.click(screen.getByTestId("change-submit"));
    expect(await screen.findByTestId("auth-error")).toHaveTextContent(
      "Mật khẩu hiện tại không đúng.",
    );
  });

  it("renews the session on success", async () => {
    server.use(
      http.post("*/api/v1/auth/password", () =>
        ok({ token: "t-new", accessToken: "t-new", user: testUser() }),
      ),
    );
    renderWithApp(<ChangePasswordPage />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId("current-password"), PASSWORD);
    await typeNewPassword(user);
    await user.click(screen.getByTestId("change-submit"));
    expect(await screen.findByTestId("change-done")).toBeInTheDocument();
    expect(localStorage.getItem("codecash.accessToken")).toBe("t-new");
  });
});
