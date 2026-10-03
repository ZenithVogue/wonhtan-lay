"use client";

import {
  Bell,
  Bot,
  Crown,
  CircleHelp,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { TranslationKey } from "@/lib/i18n";
import { usePlan } from "@/hooks/usePlan";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CommandPalette from "@/components/CommandPalette";
import ShopSwitcher from "@/components/ShopSwitcher";
import { toast } from "sonner";

const NAV_ITEMS: { key: TranslationKey; label: string; icon: typeof Bot; href: string; badge?: string }[] = [
  { key: "nav.dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "nav.orders", label: "Orders", icon: ClipboardList, href: "/dashboard/orders" },
  { key: "nav.bots", label: "Bot Connections", icon: Bot, href: "/dashboard/bot-settings", badge: "2" },
  { key: "nav.products", label: "Products / Menu", icon: ShoppingBag, href: "/dashboard/products" },
  { key: "nav.slip", label: "Slip Verifier", icon: FileCheck2, href: "/dashboard/slip-verifier" },
  { key: "nav.settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
  { key: "nav.help", label: "Help & Support", icon: LifeBuoy, href: "/dashboard/help" },
];

/** Header page titles per route (bilingual in Myanmar mode, English-only in English mode). */
const PATH_TITLE_KEYS: Record<string, TranslationKey> = {
  "/dashboard": "title.dashboard",
  "/dashboard/orders": "title.orders",
  "/dashboard/bot-settings": "title.bots",
  "/dashboard/bots": "title.bots",
  "/dashboard/products": "title.products",
  "/dashboard/slip-verifier": "title.slip",
  "/dashboard/settings": "title.settings",
  "/dashboard/help": "title.help",
};

type DashboardShellProps = {
  children: React.ReactNode;
  /** Bilingual page title shown in the header (auto-derived from the route when omitted). */
  title?: string;
  /** Extra content for the right side of the header (search, notifications, …). */
  actions?: React.ReactNode;
};

/**
 * Shared frame for every /dashboard/* page: sidebar navigation + sticky header.
 *
 * The hamburger Menu (☰) button in the header is only shown while the sidebar
 * is closed/collapsed. While the sidebar is open, only its internal Close (X)
 * button is visible. On mobile the sidebar is a drawer; on desktop it
 * collapses/expands.
 */
export default function DashboardShell({ children, title, actions }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);
  const { account, plan, planLabel } = usePlan();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");

  // Ctrl+K / ⌘+K toggles the global search palette from anywhere in the dashboard.
  useEffect(() => {
    setShortcutLabel(/Mac|iPhone|iPad/i.test(navigator.platform) ? "⌘K" : "Ctrl K");
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(value => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /** Whether the sidebar is currently visible, for the active breakpoint. */
  const sidebarOpen = isDesktop ? !collapsed : mobileNav;

  // Always close the drawer when navigating to another page.
  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  const openSidebar = () => (isDesktop ? setCollapsed(false) : setMobileNav(true));
  const closeSidebar = () => (isDesktop ? setCollapsed(true) : setMobileNav(false));

  const headerTitle = title ?? t(PATH_TITLE_KEYS[pathname] ?? "title.dashboard");
  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`)) ||
    (href === "/dashboard/bot-settings" && pathname === "/dashboard/bots");

  const planStyles =
    plan === "free"
      ? { text: "text-slate-400", dot: "bg-slate-500" }
      : plan === "basic"
        ? { text: "text-sky-300", dot: "bg-sky-300" }
        : { text: "text-emerald-300", dot: "bg-emerald-300" };

  return (
    <div
      className={`dashboard-shell min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white ${
        collapsed ? "dashboard-shell-collapsed" : ""
      }`}
    >
      <aside className={`dashboard-sidebar ${mobileNav ? "dashboard-sidebar-open" : ""}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5 lg:px-6">
            <Link href="/" className="flex items-center gap-3" aria-label="WonHtan Lay home">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-emerald-400 shadow-[0_8px_24px_rgba(78,84,220,0.3)]">
                <Bot className="size-4 text-white" />
              </span>
              <span>
                <span className="block font-display text-[15px] font-bold tracking-tight text-white">
                  WonHtan Lay
                </span>
                <span className="block text-[10px] font-medium tracking-[0.12em] text-slate-500">
                  ဝန်ထမ်းလေး
                </span>
              </span>
            </Link>
            <button className="dashboard-close" onClick={closeSidebar} aria-label="Close navigation">
              <X className="size-4" />
            </button>
          </div>

          <div className="px-4 pt-5">
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`dashboard-nav-item ${active ? "dashboard-nav-active" : ""}`}
                    onClick={() => setMobileNav(false)}
                  >
                    <Icon className="size-[17px] shrink-0" />
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-[13px] font-medium">{item.label}</span>
                      {lang === "my" && <span className="mt-0.5 block text-[10px] text-slate-500">{t(item.key)}</span>}
                    </span>
                    {item.badge && (
                      <span className="rounded-md bg-indigo-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mx-4 mt-auto rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Store className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-white">
                  {account?.shop || t("shell.noShop")}
                </span>
                <span className={`mt-1 flex items-center gap-1 text-[10px] ${planStyles.text}`}>
                  <span className={`size-1.5 rounded-full ${planStyles.dot}`} /> {planLabel}
                </span>
              </span>
            </div>
            {(plan === "free" || plan === "basic") && (
              <Link
                href="/dashboard/settings?tab=billing"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-300/15 px-2 py-2 text-[11px] font-semibold text-amber-200 transition hover:bg-amber-300/25"
              >
                <Crown className="size-3.5" /> {t("shell.upgrade")}
              </Link>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div role="group" aria-label={t("shell.theme")} className="flex rounded-lg border border-white/10 bg-black/10 p-0.5">
                {(
                  [
                    { id: "light", icon: Sun, label: t("shell.light") },
                    { id: "dark", icon: Moon, label: t("shell.dark") },
                  ] as const
                ).map(option => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={theme === option.id}
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => theme !== option.id && toggleTheme?.()}
                    className={`flex h-7 flex-1 items-center justify-center rounded-md transition active:scale-95 ${
                      theme === option.id ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <option.icon className="size-3.5" />
                  </button>
                ))}
              </div>
              <div role="group" aria-label={t("shell.language")} className="flex rounded-lg border border-white/10 bg-black/10 p-0.5">
                {(
                  [
                    { id: "my", flag: "🇲🇲", code: "MM" },
                    { id: "en", flag: "🇬🇧", code: "EN" },
                  ] as const
                ).map(option => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={lang === option.id}
                    aria-label={option.id === "my" ? "မြန်မာ" : "English"}
                    title={option.id === "my" ? "မြန်မာ" : "English"}
                    onClick={() => setLang(option.id)}
                    className={`flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-[10px] font-bold transition active:scale-95 ${
                      lang === option.id ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span aria-hidden="true">{option.flag}</span>
                    {option.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-5 text-[10px] text-slate-600 lg:px-6">
            <CircleHelp className="size-3.5" /> {t("shell.needHelp")}{" "}
            <Link href="/dashboard/help" className="text-slate-400 hover:text-white">
              {t("shell.contact")}
            </Link>
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <div className="dashboard-main min-w-0">
        <header className="dashboard-header">
          <div className="flex min-w-0 items-center gap-3">
            {!sidebarOpen && (
              <button className="dashboard-menu" onClick={openSidebar} aria-label="Open navigation">
                <Menu className="size-5" />
              </button>
            )}
            {!sidebarOpen && (
              <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="WonHtan Lay home">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-emerald-400 shadow-[0_8px_24px_rgba(78,84,220,0.3)]">
                  <Bot className="size-4 text-white" />
                </span>
                <span className="font-display text-[15px] font-bold tracking-tight text-white">WonHtan Lay</span>
              </Link>
            )}
            <h1 className="hidden min-w-0 truncate border-l border-white/10 pl-3 text-xs font-medium text-slate-300 sm:block">
              {headerTitle}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {actions}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="dashboard-search relative hidden items-center gap-2 text-left text-slate-500 md:flex"
              aria-label="Search (Ctrl+K)"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <span className="flex-1 truncate">{t("shell.search")}</span>
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">{shortcutLabel}</kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="dashboard-icon-button md:hidden"
              aria-label="Search"
            >
              <Search className="size-[17px]" />
            </button>
            <button
              type="button"
              className="dashboard-icon-button relative"
              onClick={() => toast("You are all caught up", { description: "No new notification right now." })}
              aria-label="Notifications"
            >
              <Bell className="size-[17px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-300" />
            </button>
            <ShopSwitcher />
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
