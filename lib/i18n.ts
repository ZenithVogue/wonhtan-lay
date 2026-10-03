/**
 * Minimal UI dictionary for the language switcher (Myanmar / English).
 *
 * Covers the dashboard chrome (sidebar, header, page titles) and the Settings
 * page. Other page bodies are still written in their original language.
 */

export type Lang = "my" | "en";
export const LANG_KEY = "wl_lang";
export const DEFAULT_LANG: Lang = "my";

export function isLang(value: unknown): value is Lang {
  return value === "my" || value === "en";
}

const DICT = {
  // Navigation (English label stays primary; Burmese is the secondary line in "my")
  "nav.dashboard": { my: "ပင်မစာမျက်နှာ", en: "Dashboard" },
  "nav.orders": { my: "အော်ဒါများ", en: "Orders" },
  "nav.bots": { my: "Bot ချိတ်ဆက်ရန်", en: "Bot Connections" },
  "nav.products": { my: "ပစ္စည်းစာရင်း", en: "Products / Menu" },
  "nav.slip": { my: "ငွေလွှဲစလစ်စစ်ရန်", en: "Slip Verifier" },
  "nav.settings": { my: "ဆက်တင်များ", en: "Settings" },
  "nav.help": { my: "အကူအညီနှင့် လမ်းညွှန်", en: "Help & Support" },

  // Header page titles
  "title.dashboard": { my: "ပင်မစာမျက်နှာ (Dashboard)", en: "Dashboard" },
  "title.orders": { my: "အော်ဒါများ (Orders)", en: "Orders" },
  "title.bots": { my: "Bot ချိတ်ဆက်ရန် (Bot Connections)", en: "Bot Connections" },
  "title.products": { my: "ပစ္စည်းစာရင်းများ (Products)", en: "Products" },
  "title.slip": { my: "ငွေလွှဲစလစ် စစ်ဆေးရန် (Slip Verifier)", en: "Slip Verifier" },
  "title.settings": { my: "ဆက်တင်များ (Settings)", en: "Settings" },
  "title.help": { my: "အကူအညီနှင့် လမ်းညွှန် (Help & Support)", en: "Help & Support" },

  // Sidebar + header
  "shell.noShop": { my: "ဆိုင်အမည် မထည့်ရသေးပါ", en: "No shop name yet" },
  "shell.upgrade": { my: "Pro သို့ Upgrade လုပ်မည်", en: "Upgrade to Pro" },
  "shell.theme": { my: "Theme", en: "Theme" },
  "shell.light": { my: "Light Mode", en: "Light mode" },
  "shell.dark": { my: "Dark Mode", en: "Dark mode" },
  "shell.language": { my: "ဘာသာစကား", en: "Language" },
  "shell.needHelp": { my: "အကူအညီလိုလား?", en: "Need help?" },
  "shell.contact": { my: "Support ကို ဆက်သွယ်ရန်", en: "Contact support" },
  "shell.search": { my: "ရှာဖွေရန်...", en: "Search..." },

  // Settings
  "settings.heading": { my: "ဆက်တင်များ", en: "Settings" },
  "settings.subtitle": { my: "အကောင့်အချက်အလက်နဲ့ Subscription Plan ကို စီမံပါ။", en: "Manage your account details and subscription plan." },
  "settings.logout": { my: "Logout", en: "Log out" },
  "settings.tab.billing": { my: "Billing / Subscription", en: "Billing / Subscription" },
  "settings.tab.profile": { my: "Profile", en: "Profile" },
  "settings.shopName": { my: "ဆိုင်နာမည်", en: "Shop name" },
  "settings.phone": { my: "ဖုန်းနံပါတ်", en: "Phone number" },
  "settings.noShop": { my: "ဆိုင်အမည် မထည့်ရသေးပါ", en: "No shop name yet" },
  "settings.noName": { my: "အမည်မရှိသေးပါ", en: "No name yet" },
  "settings.language.title": { my: "ဘာသာစကား", en: "Language" },
  "settings.language.desc": { my: "Dashboard မှာ အသုံးပြုမယ့် ဘာသာစကားကို ရွေးပါ။", en: "Choose the language used across the dashboard." },
  "settings.language.my": { my: "မြန်မာ", en: "Myanmar" },
  "settings.language.en": { my: "English", en: "English" },
} as const;

export type TranslationKey = keyof typeof DICT;

export function translate(lang: Lang, key: TranslationKey): string {
  return DICT[key][lang];
}
