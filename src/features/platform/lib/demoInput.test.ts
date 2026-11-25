import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import type { Entity } from "@codecash/contracts";
import { resourceDemoInput } from "./demoInput";

const t = ((key: string) => key) as unknown as TFunction<"platform">;
const org = (id: string, kind: string) =>
  ({ id, name: `Org ${id}`, kind }) as unknown as Entity;
const orgs = [
  org("OPS", "INTERNAL"),
  org("B010", "BUYER"),
  org("S015", "SUPPLIER"),
];

describe("resourceDemoInput", () => {
  it("proposes an organisation with a unique code and email", () => {
    const a = resourceDemoInput("organizations", orgs, t);
    const b = resourceDemoInput("organizations", orgs, t);
    expect(a).toMatchObject({ kind: "BUYER", name: "demo.organizations" });
    expect(a.code).toMatch(/^DEMO_/);
    expect(a.code).not.toBe(b.code);
  });

  it("gives a user the role that fits the chosen organisation", () => {
    expect(resourceDemoInput("users", orgs, t)).toMatchObject({
      role: "CONTRACT_OWNER",
      organizationId: { value: "B010", label: "Org B010" },
      partyId: "B010",
    });
    expect(
      resourceDemoInput("users", orgs, t, {
        organizationId: { value: "S015" },
      }),
    ).toMatchObject({ role: "SUPPLIER", partyId: "S015" });
    expect(
      resourceDemoInput("users", orgs, t, { organizationId: "OPS" }),
    ).toMatchObject({ role: "AUDITOR", partyId: undefined });
  });

  it("references only organisations that exist", () => {
    expect(resourceDemoInput("contract-drafts", orgs, t)).toMatchObject({
      supplierId: { value: "S015" },
    });
    expect(
      resourceDemoInput("contract-drafts", [], t).supplierId,
    ).toBeUndefined();
  });

  it("covers the other resources and nothing for unknown ones", () => {
    expect(resourceDemoInput("settings", orgs, t).value).toBe(
      "demo.settingValue",
    );
    expect(
      resourceDemoInput("milestone-templates", orgs, t).paymentPercent,
    ).toBe("20.00");
    expect(resourceDemoInput("contract-templates", orgs, t).maxPenaltyPct).toBe(
      "8.00",
    );
    expect(resourceDemoInput("unknown", orgs, t)).toEqual({});
  });
});
