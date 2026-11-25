import { describe, expect, it } from "vitest";
import { initialsOf, organizationInitials } from "./initials";

describe("initials", () => {
  it("takes two letters of the given name without tone marks", () => {
    expect(initialsOf("Phạm Minh Đức")).toBe("ĐU");
    expect(initialsOf("  Nguyễn Văn An ")).toBe("AN");
    expect(initialsOf("")).toBe("");
  });

  it("skips legal forms in organisation names", () => {
    expect(organizationInitials("Nova An Business JSC")).toBe("NA");
    expect(organizationInitials("Công ty TNHH Đông Á")).toBe("DA");
    expect(organizationInitials("JSC")).toBe("J");
  });
});
