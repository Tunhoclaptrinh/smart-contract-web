import { describe, expect, it } from "vitest";
import { toSignUpInput } from "./RegisterPage";

describe("toSignUpInput", () => {
  it("trims the fields and leaves out empty optional ones", () => {
    expect(
      toSignUpInput({
        name: "  Công ty Minh Long ",
        code: " ML01 ",
        kind: "SUPPLIER",
        companyEmail: "  ",
        taxCode: "",
        displayName: " Trần Văn Long ",
        email: " long@minhlong.vn ",
        password: " giữ nguyên cả khoảng trắng ",
        confirm: " giữ nguyên cả khoảng trắng ",
      }),
    ).toEqual({
      organization: {
        name: "Công ty Minh Long",
        code: "ML01",
        kind: "SUPPLIER",
      },
      admin: {
        displayName: "Trần Văn Long",
        email: "long@minhlong.vn",
        password: " giữ nguyên cả khoảng trắng ",
      },
    });
  });

  it("sends the optional company email and tax code when given", () => {
    const input = toSignUpInput({
      name: "Nova",
      code: "NV",
      kind: "BUYER",
      companyEmail: "lienhe@nova.vn",
      taxCode: "0101234567",
      displayName: "A",
      email: "a@nova.vn",
      password: "MotMatKhauDai2026!",
      confirm: "MotMatKhauDai2026!",
    });
    expect(input.organization).toMatchObject({
      email: "lienhe@nova.vn",
      taxCode: "0101234567",
    });
  });
});
