import { describe, expect, it } from "vitest";
import { landingRouteFor, parsePlanParam, planBadgeText, type Account } from "./account";

describe("parsePlanParam", () => {
  it("selects pro for ?plan=pro (any case, padded)", () => {
    expect(parsePlanParam("pro")).toBe("pro");
    expect(parsePlanParam("PRO")).toBe("pro");
    expect(parsePlanParam("  Pro ")).toBe("pro");
  });

  it("falls back to free for anything else", () => {
    expect(parsePlanParam("free")).toBe("free");
    expect(parsePlanParam("enterprise")).toBe("free");
    expect(parsePlanParam("")).toBe("free");
    expect(parsePlanParam(null)).toBe("free");
    expect(parsePlanParam(undefined)).toBe("free");
  });
});

describe("planBadgeText", () => {
  it("shows the Pro price badge", () => {
    expect(planBadgeText("pro")).toBe("Pro Plan (15,000 MMK / လ) အတွက် အကောင့်ဖွင့်နေသည်");
  });

  it("shows the Free badge", () => {
    expect(planBadgeText("free")).toBe("Free Plan အတွက် အကောင့်ဖွင့်နေသည်");
  });
});

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
