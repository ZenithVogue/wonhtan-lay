import { describe, expect, it } from "vitest";
import { BILLING_TIERS, PLAN_META } from "./plans";
import { TRANSLATION_KEYS, translate, type TranslationKey } from "./i18n";

const BURMESE = /[\u1000-\u109f]/;
const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe("i18n dictionary", () => {
  it("has a non-empty string for every key in both locales", () => {
    for (const key of TRANSLATION_KEYS) {
      expect(translate("my", key).trim(), `my:${key}`).not.toBe("");
      expect(translate("en", key).trim(), `en:${key}`).not.toBe("");
    }
  });

  it("keeps English free of Burmese script", () => {
    for (const key of TRANSLATION_KEYS) {
      if (key === "settings.language.my") continue;
      expect(BURMESE.test(translate("en", key)), `en:${key}`).toBe(false);
    }
  });

  it("uses the same {placeholders} in both locales", () => {
    for (const key of TRANSLATION_KEYS) {
      expect(placeholders(translate("en", key)), key).toEqual(placeholders(translate("my", key)));
    }
  });

  it("fills placeholders", () => {
    expect(translate("en", "settings.btn.upgrade", { name: "Pro" })).toBe("Upgrade to Pro");
    expect(translate("en", "help.guide.step", { n: 2 })).toBe("Step 2");
  });

  it("provides a tagline and one translation per feature for every plan", () => {
    for (const plan of [...BILLING_TIERS, "free" as const]) {
      expect(TRANSLATION_KEYS).toContain(`plan.${plan}.tagline`);
      PLAN_META[plan].features.forEach((_, i) => {
        expect(TRANSLATION_KEYS).toContain(`plan.${plan}.f${i + 1}` as TranslationKey);
      });
      expect(TRANSLATION_KEYS).not.toContain(`plan.${plan}.f${PLAN_META[plan].features.length + 1}` as TranslationKey);
    }
  });

  it("covers every help guide step used by the page", () => {
    const steps: Record<string, number> = { g1: 4, g2: 4, g3: 3, g4: 3 };
    for (const [id, count] of Object.entries(steps)) {
      for (let n = 1; n <= count; n++) expect(TRANSLATION_KEYS).toContain(`help.${id}.s${n}` as TranslationKey);
      expect(TRANSLATION_KEYS).toContain(`help.${id}.title` as TranslationKey);
      expect(TRANSLATION_KEYS).toContain(`help.${id}.cta` as TranslationKey);
    }
  });
});
