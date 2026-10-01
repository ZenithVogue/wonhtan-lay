import { describe, expect, it } from "vitest";
import { landingRouteFor, type Account } from "./account";

describe("landingRouteFor", () => {
  const base: Account = {
    name: "May",
    shop: "KPay Verified Shop",
    phone: "09123456789",
    password: "secret1",
    plan: "free",
    proUnlocked: true,
    createdAt: new Date().toISOString(),
  };

  it("sends free accounts straight to the dashboard", () => {
    expect(landingRouteFor(base)).toBe("/dashboard");
  });

  it("sends paid pro accounts to the dashboard", () => {
    expect(landingRouteFor({ ...base, plan: "pro", proUnlocked: true })).toBe("/dashboard");
  });

  it("sends unpaid pro sign-ups to checkout", () => {
    expect(landingRouteFor({ ...base, plan: "pro", proUnlocked: false })).toBe("/checkout?plan=pro");
  });

  it("sends unpaid basic upgrades to basic checkout", () => {
    expect(landingRouteFor({ ...base, plan: "basic", proUnlocked: false })).toBe("/checkout?plan=basic");
  });
});
