/**
 * Minimal UI dictionary for the language switcher (Myanmar / English).
 *
 * Covers the dashboard chrome (sidebar, header, page titles), Settings
 * (Billing + Profile) and Help & Support. Other page bodies are still written
 * in their original language.
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
  "shell.switchToLight": { my: "Light Mode သို့ ပြောင်းမည်", en: "Switch to light mode" },
  "shell.switchToDark": { my: "Dark Mode သို့ ပြောင်းမည်", en: "Switch to dark mode" },
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

  // Help & Support
  "help.label": { my: "HELP & SUPPORT", en: "HELP & SUPPORT" },
  "help.title": { my: "အကူအညီနှင့် လမ်းညွှန်", en: "Help & Support" },
  "help.subtitle": { my: "အသုံးပြုပုံ လမ်းညွှန်ကိုဖတ်ပြီး မေးစရာရှိရင် Telegram မှာ အဖွဲ့ကို ဆက်သွယ်ပါ။", en: "For usage guides and inquiries, join us on Telegram or contact support." },
  "help.community.title": { my: "Telegram Community Group", en: "Telegram Community Group" },
  "help.community.desc": { my: "အခြား ဆိုင်ပိုင်ရှင်တွေနဲ့ မေးမြန်းဆွေးနွေးပြီး အဖွဲ့ကို တိုက်ရိုက်ဆက်သွယ်ပါ။", en: "Discuss with other shop owners and get instant help." },
  "help.community.cta": { my: "Group ထဲဝင်မည်", en: "Join Group" },
  "help.channel.title": { my: "Telegram Channel", en: "Telegram Channel" },
  "help.channel.desc": { my: "Feature အသစ်များ၊ update များနှင့် အသိပေးချက်များကို အရင်ဆုံး ရယူပါ။", en: "Get the latest feature updates and announcements." },
  "help.channel.cta": { my: "Channel ကို Follow မည်", en: "Follow Channel" },
  "help.guide.label": { my: "USER GUIDE", en: "USER GUIDE" },
  "help.guide.heading": { my: "အသုံးပြုနည်း လမ်းညွှန်", en: "User Guide" },
  "help.guide.step": { my: "Step {n}", en: "Step {n}" },
  "help.g1.title": { my: "စတင်အသုံးပြုခြင်း", en: "Getting Started" },
  "help.g1.s1": { my: "အကောင့်ဖွင့်ပြီး Sign in ဝင်ပါ။", en: "Create an account and sign in." },
  "help.g1.s2": { my: "အပေါ်ညာထောင့် Active shop မှ “ဆိုင်အမည် ထည့်သွင်းရန်” ကိုနှိပ်ပြီး ဆိုင်အမည်၊ ဖုန်းနံပါတ်နှင့် KPay QR Code ထည့်ပါ။", en: "From the Active shop menu at the top right, choose “Add shop name”, then enter your shop name, phone number and KPay QR code." },
  "help.g1.s3": { my: "Dashboard မှာ ဒီနေ့ အော်ဒါနဲ့ ဝင်ငွေကို တစ်နေရာတည်းမှာ ကြည့်ပါ။", en: "See today's orders and revenue in one place on the Dashboard." },
  "help.g1.s4": { my: "“စမ်းသပ်အော်ဒါ ပို့ကြည့်မည်” ကိုနှိပ်ပြီး စနစ်အလုပ်လုပ်ပုံကို စမ်းကြည့်ပါ။", en: "Click “Send a test order” to see how the system works." },
  "help.g1.cta": { my: "Dashboard သို့သွားမည်", en: "Go to Dashboard" },
  "help.g2.title": { my: "Telegram Bot ချိတ်ဆက်ခြင်း", en: "Connect Your Telegram Bot" },
  "help.g2.s1": { my: "Telegram ထဲက @BotFather ကို ဖွင့်ပြီး /newbot နဲ့ Bot အသစ်ဖန်တီးပါ။", en: "Open @BotFather in Telegram and create a new bot with /newbot." },
  "help.g2.s2": { my: "BotFather ပေးတဲ့ Bot Token နဲ့ Bot Username (@ မပါဘဲ) ကို copy ကူးပါ။", en: "Copy the Bot Token and Bot Username (without the @) that BotFather gives you." },
  "help.g2.s3": { my: "Bot ချိတ်ဆက်ရန် စာမျက်နှာမှာ Token နဲ့ Username ကို ထည့်ပြီး Connect နှိပ်ပါ။", en: "On the Bot Connections page, enter the Token and Username, then click Connect." },
  "help.g2.s4": { my: "Customer တွေ Bot ထဲမှာ မှာယူတဲ့ အော်ဒါတွေ Orders ထဲ အလိုအလျောက် ဝင်လာပါမယ်။", en: "Orders your customers place in the bot appear in Orders automatically." },
  "help.g2.cta": { my: "Bot ချိတ်ဆက်ရန်", en: "Connect Bot" },
  "help.g3.title": { my: "ပစ္စည်းစာရင်း စီမံခြင်း", en: "Managing Products" },
  "help.g3.s1": { my: "Products / Menu စာမျက်နှာကို ဖွင့်ပါ။", en: "Open the Products / Menu page." },
  "help.g3.s2": { my: "ပစ္စည်းအသစ်ထည့်ရန် ပစ္စည်းနာမည်၊ စျေးနှုန်း၊ အမျိုးအစားနှင့် command ကို ဖြည့်ပါ။", en: "To add a product, fill in its name, price, category and command." },
  "help.g3.s3": { my: "စျေးနှုန်း ပြောင်းလိုရင် ပစ္စည်းကို ပြင်ဆင်ပြီး သိမ်းပါ။ မရောင်းတော့တာကို ဖျက်နိုင်ပါတယ်။", en: "To change a price, edit the product and save. You can delete items you no longer sell." },
  "help.g3.cta": { my: "ပစ္စည်းစာရင်းသို့", en: "Go to Products" },
  "help.g4.title": { my: "ငွေလွှဲစလစ် စစ်ဆေးခြင်း", en: "Verifying Payment Slips" },
  "help.g4.s1": { my: "Slip Verifier စာမျက်နှာကို ဖွင့်ပါ။", en: "Open the Slip Verifier page." },
  "help.g4.s2": { my: "Customer ပို့ထားတဲ့ KPay / Wave Pay screenshot ကို တင်ပါ။", en: "Upload the KPay / Wave Pay screenshot your customer sent." },
  "help.g4.s3": { my: "ငွေပမာဏ၊ လွှဲသူ၊ ရက်စွဲနဲ့ Transaction ID ကို စစ်ဆေးပြီး ကိုက်ညီမှ အော်ဒါကို အတည်ပြုပါ။", en: "Check the amount, sender, date and Transaction ID, then confirm the order once everything matches." },
  "help.g4.cta": { my: "Slip စစ်ရန်", en: "Verify Slips" },

  // Settings › Billing / Profile (extra)
  "settings.currentPlan": { my: "လက်ရှိ Plan", en: "CURRENT PLAN" },
  "settings.planName": { my: "{name} Plan", en: "{name} Plan" },
  "settings.active": { my: "Active", en: "Active" },
  "settings.banner.noShop": { my: "ဆိုင်အမည် မရှိသေးပါ", en: "No shop name yet" },
  "settings.banner.noAccount": { my: "အကောင့်မရှိသေးပါ — Plan ရွေးပြီး အကောင့်ဖွင့်ပါ။", en: "No account yet — pick a plan and create an account." },
  "settings.cycle.monthly": { my: "လစဉ် (Monthly)", en: "Monthly" },
  "settings.cycle.yearly": { my: "နှစ်စဉ် (Yearly)", en: "Yearly" },
  "settings.cycle.badge": { my: "၂ လ အခမဲ့", en: "2 Months Free" },
  "settings.cycle.note": { my: "နှစ်စဉ်ပေးချေရင် ၁၂ လအစား ၁၀ လစာသာ ပေးရပါတယ်။", en: "Pay yearly and you're charged for 10 months instead of 12." },
  "settings.popular": { my: "Popular", en: "Popular" },
  "settings.price.custom": { my: "Custom", en: "Custom" },
  "settings.unit.month": { my: "MMK / လ", en: "MMK / month" },
  "settings.unit.year": { my: "MMK / နှစ်", en: "MMK / year" },
  "settings.btn.current": { my: "လက်ရှိအသုံးပြုနေသည်", en: "Current plan" },
  "settings.btn.contact": { my: "အဖွဲ့နဲ့ ဆက်သွယ်မည်", en: "Contact Support" },
  "settings.btn.upgrade": { my: "{name} ကို Upgrade မည်", en: "Upgrade to {name}" },
  "settings.btn.switch": { my: "{name} ကို ပြောင်းမည်", en: "Switch to {name}" },
  "settings.disclaimer": { my: "Upgrade လုပ်ရင် KPay / WavePay Checkout ကို ပို့ပေးပါမယ်။ Downgrade က Demo mode မှာ ချက်ချင်းသက်ရောက်ပါတယ်။", en: "Upgrading sends you to KPay / WavePay Checkout. Downgrade takes effect immediately in Demo mode." },
  "settings.toast.enterprise.title": { my: "Enterprise အတွက် ဆက်သွယ်ပါ", en: "Contact us about Enterprise" },
  "settings.toast.enterprise.desc": { my: "အဖွဲ့နဲ့ ဆွေးနွေးပြီး သင့်အတွက် သင့်တော်တဲ့ စျေးနှုန်းကို ရယူပါ။", en: "Talk to our team and get pricing that fits your business." },
  "settings.toast.switched.title": { my: "{name} Plan ကို ပြောင်းပြီးပါပြီ", en: "Switched to the {name} plan" },
  "settings.toast.switched.desc": { my: "Demo mode ဖြစ်သောကြောင့် ချက်ချင်း သက်ရောက်သွားပါတယ်။", en: "This takes effect immediately because it's Demo mode." },
  "settings.toast.logout.title": { my: "Logged out", en: "Logged out" },
  "settings.toast.logout.desc": { my: "Demo account မှ ထွက်လိုက်ပါပြီ။", en: "You've signed out of the demo account." },
  "settings.noAccount": { my: "အကောင့်မရှိသေးပါ", en: "No account yet" },
  "settings.createAccount": { my: "အကောင့်ဖွင့်မည်", en: "Create account" },

  // Plan taglines + feature lists (English mirrors lib/plans.ts)
  "plan.free.tagline": { my: "စမ်းကြည့်ရန်အတွက်", en: "To try things out" },
  "plan.free.f1": { my: "တစ်လလျှင် အော်ဒါ ၅၀", en: "50 orders per month" },
  "plan.free.f2": { my: "Telegram Bot ၁ ခု ချိတ်ဆက်နိုင်", en: "Connect 1 Telegram Bot" },
  "plan.free.f3": { my: "Basic support", en: "Basic support" },
  "plan.basic.tagline": { my: "ဆိုင်လေးတွေ စနစ်တကျစဖို့", en: "For small shops managing simple orders" },
  "plan.basic.f1": { my: "တစ်လလျှင် အော်ဒါ ၅၀၀", en: "500 orders per month" },
  "plan.basic.f2": { my: "Telegram Bot ၁ ခု ချိတ်ဆက်နိုင်", en: "Connect 1 Telegram Bot" },
  "plan.basic.f3": { my: "Delivery Slip Export (PDF)", en: "Delivery Slip Export (PDF)" },
  "plan.basic.f4": { my: "Email support", en: "Email support" },
  "plan.pro.tagline": { my: "ဆိုင်ကြီးထွားလာပြီဆိုရင်", en: "For growing businesses needing scale" },
  "plan.pro.f1": { my: "အော်ဒါ အကန့်အသတ်မရှိ", en: "Unlimited orders" },
  "plan.pro.f2": { my: "Auto Delivery Slip Export (PDF)", en: "Auto Delivery Slip Export (PDF)" },
  "plan.pro.f3": { my: "KPay / Wave Slip Verifier", en: "KPay / Wave Slip Verifier" },
  "plan.pro.f4": { my: "Priority support", en: "Priority support" },
  "plan.enterprise.tagline": { my: "Brand ကြီးတွေအတွက်", en: "For large brand operations" },
  "plan.enterprise.f1": { my: "အော်ဒါအကန့်အသတ်မရှိ + ဆိုင်ခွဲအများ", en: "Unlimited orders + multiple shop support" },
  "plan.enterprise.f2": { my: "Dedicated account manager", en: "Dedicated account manager" },
  "plan.enterprise.f3": { my: "Custom Bot flows + API", en: "Custom Bot flows + API" },
  "plan.enterprise.f4": { my: "SLA + Priority support", en: "SLA + Priority support" },
} as const;

export type TranslationKey = keyof typeof DICT;

/** Look up `key` for `lang`; `{name}`-style placeholders are filled from `vars`. */
export function translate(lang: Lang, key: TranslationKey, vars?: Record<string, string | number>): string {
  const text: string = DICT[key][lang];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

/** Every dictionary key (used by tests to verify both locales are complete). */
export const TRANSLATION_KEYS = Object.keys(DICT) as TranslationKey[];
