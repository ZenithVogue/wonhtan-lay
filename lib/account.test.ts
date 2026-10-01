import { describe, expect, it } from "vitest";
import { addShopTo, getActiveShop, isPasswordComplex, setActiveShopIn, updateShopIn, landingRouteFor, type Account } from "./account";

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

describe("isPasswordComplex", () => {
  it("requires at least one English letter and one digit", () => {
    expect(isPasswordComplex("abc123")).toBe(true);
    expect(isPasswordComplex("123456")).toBe(false);
    expect(isPasswordComplex("abcdef")).toBe(false);
    expect(isPasswordComplex("မြန်မာ123")).toBe(false);
  });
});

describe("shops", () => {
  const account: Account = {
    name: "May",
    shop: "",
    phone: "09123456789",
    password: "abc123",
    plan: "free",
    proUnlocked: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  it("starts without an active shop", () => {
    expect(getActiveShop(account)).toBeNull();
  });

  it("adds, updates and switches shops", () => {
    const one = addShopTo(account, { name: " May Fashion ", phone: "0911" }, "a");
    expect(one.shop).toBe("May Fashion");
    expect(getActiveShop(one)?.id).toBe("a");

    const two = addShopTo(one, { name: "Second", phone: "0922", kpayQr: "data:image/png;base64,xx" }, "b");
    expect(two.shops).toHaveLength(2);
    expect(two.shop).toBe("Second");

    const back = setActiveShopIn(two, "a");
    expect(back.shop).toBe("May Fashion");

    const renamed = updateShopIn(back, "a", { name: "Renamed", phone: "0933" });
    expect(renamed.shop).toBe("Renamed");
    expect(renamed.shops?.[0].phone).toBe("0933");
    expect(renamed.shops?.[1].kpayQr).toBeDefined();
  });
});
