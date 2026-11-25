import { describe, expect, it } from "vitest";
import { emptyInputPatch, fillEmptyInputs, isEmptyInput } from "./form-input";

describe("form input helpers", () => {
  it("treats undefined, null, blank text and empty lists as empty", () => {
    for (const value of [undefined, null, "", "  ", []])
      expect(isEmptyInput(value)).toBe(true);
    for (const value of [0, false, "x", ["a"], {}])
      expect(isEmptyInput(value)).toBe(false);
  });

  it("only fills fields the person left empty, never overwrites", () => {
    const current = {
      name: "Đã nhập",
      email: "",
      note: undefined as string | undefined,
    };
    const sample = { name: "Mẫu", email: "mau@example.test", note: "" };
    expect(emptyInputPatch(current, sample)).toEqual({
      email: "mau@example.test",
    });
    expect(fillEmptyInputs(current, sample)).toEqual({
      name: "Đã nhập",
      email: "mau@example.test",
      note: undefined,
    });
  });
});
