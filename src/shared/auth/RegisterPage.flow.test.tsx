import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithApp, testUser } from "@/test/render";
import { fail, http, ok, server } from "@/test/server";
import RegisterPage from "./RegisterPage";

const page = () =>
  renderWithApp(
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/platform/users" element={<p>danh sách người dùng</p>} />
    </Routes>,
    { user: null, path: "/register" },
  );

async function fillIn() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Tên công ty"), "Công ty Minh Long");
  await user.type(screen.getByLabelText("Mã công ty"), "ML01");
  await user.type(screen.getByLabelText("Họ và tên"), "Trần Văn Long");
  await user.type(screen.getByLabelText("Email đăng nhập"), "long@minhlong.vn");
  await user.type(screen.getByLabelText("Mật khẩu"), "MotMatKhauDai2026!");
  await user.type(
    screen.getByLabelText("Nhập lại mật khẩu"),
    "MotMatKhauDai2026!",
  );
  await user.click(screen.getByTestId("register-submit"));
}

describe("company sign-up", () => {
  it("signs the new administrator in and opens their landing screen", async () => {
    let sent: unknown;
    server.use(
      http.post("*/api/v1/auth/register", async ({ request }) => {
        sent = await request.json();
        return ok({
          token: "token-1",
          user: testUser({
            id: "u-new",
            role: "ORG_ADMIN",
            email: "long@minhlong.vn",
            permissions: ["users:read", "users:create"],
          }),
        });
      }),
    );
    page();
    await fillIn();
    expect(await screen.findByText("danh sách người dùng")).toBeInTheDocument();
    expect(sent).toEqual({
      organization: { name: "Công ty Minh Long", code: "ML01", kind: "BUYER" },
      admin: {
        displayName: "Trần Văn Long",
        email: "long@minhlong.vn",
        password: "MotMatKhauDai2026!",
      },
    });
    expect(localStorage.getItem("scw.accessToken")).toBe("token-1");
  });

  it("shows the API's reason when the email is taken and stays on the form", async () => {
    server.use(
      http.post("*/api/v1/auth/register", () => fail(409, "EMAIL_TAKEN")),
    );
    page();
    await fillIn();
    expect(await screen.findByTestId("register-error")).toHaveTextContent(
      "Email này đã có tài khoản.",
    );
    expect(screen.queryByText("danh sách người dùng")).not.toBeInTheDocument();
  });

  it("does not send a form whose passwords differ", async () => {
    let calls = 0;
    server.use(
      http.post("*/api/v1/auth/register", () => {
        calls++;
        return fail(500, "X");
      }),
    );
    page();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Mật khẩu"), "MotMatKhauDai2026!");
    await user.type(
      screen.getByLabelText("Nhập lại mật khẩu"),
      "KhacHoanToan2026!",
    );
    await user.click(screen.getByTestId("register-submit"));
    expect(
      await screen.findByText("Hai mật khẩu chưa khớp."),
    ).toBeInTheDocument();
    expect(calls).toBe(0);
  });
});
