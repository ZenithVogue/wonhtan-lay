import { describe, expect, it } from "vitest";
import {
  BILLING_TIERS,
  formatPlanPrice,
  formatPlanPriceFor,
  parseBillingCycle,
  planUnitFor,
  isPlan,
  parseCheckoutPlan,
  PLAN_META,
  PLAN_RANK,
} from "./plans";

describe("parseCheckoutPlan", () => {
  it("selects basic for ?plan=basic (any case, padded)", () => {
    expect(parseCheckoutPlan("basic")).toBe("basic");
    expect(parseCheckoutPlan("BASIC")).toBe("basic");
    expect(parseCheckoutPlan("  Basic ")).toBe("basic");
  });

  it("defaults to pro for anything else", () => {
    expect(parseCheckoutPlan("pro")).toBe("pro");
    expect(parseCheckoutPlan("free")).toBe("pro");
    expect(parseCheckoutPlan("enterprise")).toBe("pro");
    expect(parseCheckoutPlan("")).toBe("pro");
    expect(parseCheckoutPlan(null)).toBe("pro");
    expect(parseCheckoutPlan(undefined)).toBe("pro");
  });
});

describe("plan catalog", () => {
  it("orders tiers free < basic < pro < enterprise", () => {
    expect(PLAN_RANK.free).toBeLessThan(PLAN_RANK.basic);
    expect(PLAN_RANK.basic).toBeLessThan(PLAN_RANK.pro);
    expect(PLAN_RANK.pro).toBeLessThan(PLAN_RANK.enterprise);
  });

  it("shows Basic/Pro/Enterprise on the billing table", () => {
    expect(BILLING_TIERS).toEqual(["basic", "pro", "enterprise"]);
  });

  it("keeps the Pro price at 15,000 MMK", () => {
    expect(PLAN_META.pro.priceMMK).toBe(15000);
    expect(formatPlanPrice("pro")).toBe("15,000");
  });

  it("formats every tier price", () => {
    expect(formatPlanPrice("free")).toBe("0");
    expect(formatPlanPrice("basic")).toBe("5,000");
    expect(formatPlanPrice("enterprise")).toBe("Custom");
  });

  it("validates plan values", () => {
    expect(isPlan("pro")).toBe(true);
    expect(isPlan("basic")).toBe(true);
    expect(isPlan("startup")).toBe(false);
    expect(isPlan(null)).toBe(false);
  });
});

describe("billing cycles", () => {
  it("parses the cycle, defaulting to monthly", () => {
    expect(parseBillingCycle("yearly")).toBe("yearly");
    expect(parseBillingCycle("anything")).toBe("monthly");
    expect(parseBillingCycle(null)).toBe("monthly");
  });

  it("charges 10 months for a year and keeps Enterprise custom", () => {
    expect(formatPlanPriceFor("pro", "monthly")).toBe("15,000");
    expect(formatPlanPriceFor("pro", "yearly")).toBe("150,000");
    expect(formatPlanPriceFor("enterprise", "yearly")).toBe("Custom");
    expect(planUnitFor("basic", "yearly")).toBe("MMK / နှစ်");
    expect(planUnitFor("enterprise", "monthly")).toBe("");
  });
});
