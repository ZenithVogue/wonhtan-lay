import { describe, expect, it } from "vitest";
import { analyzeSlip, extractSlipDetails, slipFingerprint, SUSPICIOUS_MAX_BYTES, type SlipFile } from "./slip";

const file = (overrides: Partial<SlipFile> = {}): SlipFile => ({
  name: "kpay.png",
  size: 200 * 1024,
  lastModified: new Date(2026, 8, 25, 10, 42).getTime(),
  type: "image/png",
  ...overrides,
});

describe("analyzeSlip", () => {
  it("verifies a normal, unseen slip", () => {
    const result = analyzeSlip(file(), new Set());
    expect(result.status).toBe("verified");
    expect(result.reason).toBeUndefined();
  });

  it("flags a slip that was already verified as duplicate", () => {
    const seen = new Set([slipFingerprint(file())]);
    expect(analyzeSlip(file(), seen).status).toBe("duplicate");
  });

  it("flags tiny or non-image files as suspicious", () => {
    expect(analyzeSlip(file({ size: SUSPICIOUS_MAX_BYTES - 1 }), new Set()).status).toBe("suspicious");
    expect(analyzeSlip(file({ type: "application/pdf" }), new Set()).status).toBe("suspicious");
  });

  it("extracts stable details for the same file", () => {
    const a = extractSlipDetails(file());
    expect(a).toEqual(extractSlipDetails(file()));
    expect(a.transactionId.startsWith("20260925")).toBe(true);
    expect(a.date).toContain("2026-09-25");
    expect(a.amount % 500).toBe(0);
  });
});
