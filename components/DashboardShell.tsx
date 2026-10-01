"use client";

import {
  Bot,
  ChevronDown,
  Crown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Settings,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePlan } from "@/hooks/usePlan";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ShopSwitcher from "@/components/ShopSwitcher";

const NAV_ITEMS = [
  { label: "Dashboard", burmese: "ပင်မစာမျက်နှာ", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Orders", burmese: "အော်ဒါများ", icon: ClipboardList, href: "/dashboard/orders" },
  { label: "Bot Connections", burmese: "Bot ချိတ်ဆက်ရန်", icon: Bot, href: "/dashboard/bot-settings", badge: "2" },
  { label: "Products / Menu", burmese: "ပစ္စည်းစာရင်း", icon: ShoppingBag, href: "/dashboard/products" },
  { label: "Slip Verifier", burmese: "ငွေလွှဲစလစ်စစ်ရန်", icon: FileCheck2, href: "/dashboard/slip-verifier" },
  { label: "Settings", burmese: "ဆက်တင်များ", icon: Settings, href: "/dashboard/settings" },
  { label: "Help & Support", burmese: "အကူအညီနှင့် လမ်းညွှန်", icon: LifeBuoy, href: "/dashboard/help" },
] as const;

const PATH_TITLES: Record<string, { title: string; myanmar: string }> = {
  "/dashboard": { title: "Dashboard", myanmar: "Dashboard" },
  "/dashboard/orders": { title: "Orders", myanmar: "အော်ဒါများ" },
  "/dashboard/bot-settings": { title: "Bot Connections", myanmar: "Bot ချိတ်ဆက်ရန်" },
  "/dashboard/bots": { title: "Bot Connections", myanmar: "Bot ချိတ်ဆက်ရန်" },
  "/dashboard/products": { title: "Products", myanmar: "ပစ္စည်းစာရင်းများ" },
  "/dashboard/slip-verifier": { title: "Slip Verifier", myanmar: "Slip Verifier" },
  "/dashboard/help": { title: "Help & Support", myanmar: "အကူအညီနှင့် လမ်းညွှန်" },
};

type DashboardShellProps = {
  children: React.ReactNode;
  /** Breadcrumb label shown in the header (auto-derived from the route when omitted). */
  title?: string;
  /** Title shown on small screens (auto-derived from the route when omitted). */
  titleMyanmar?: string;
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
export default function DashboardShell({ children, title, titleMyanmar, actions }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);
  const { account, plan, planLabel } = usePlan();
  const [collapsed, setCollapsed] = useState(false);
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

  const fallback = PATH_TITLES[pathname] ?? { title: "Dashboard", myanmar: "Dashboard" };
  const headerTitle = title ?? fallback.title;
  const headerTitleMyanmar = titleMyanmar ?? fallback.myanmar;
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
            <div className="dashboard-label px-3">WORKSPACE</div>
            <nav className="mt-3 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`dashboard-nav-item ${active ? "dashboard-nav-active" : ""}`}
                    onClick={() => setMobileNav(false)}
                  >
                    <Icon className="size-[17px] shrink-0" />
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-[13px] font-medium">{item.label}</span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">{item.burmese}</span>
                    </span>
                    {"badge" in item && item.badge && (
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
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Store className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-white">
                  {account?.shop || "ဆိုင်အမည် မထည့်ရသေးပါ"}
                </span>
                <span className={`mt-1 flex items-center gap-1 text-[10px] ${planStyles.text}`}>
                  <span className={`size-1.5 rounded-full ${planStyles.dot}`} /> {planLabel}
                </span>
              </span>
              <ChevronDown className="ml-auto size-4 text-slate-500" />
            </div>
            {(plan === "free" || plan === "basic") && <div className="my-3 h-px bg-white/[0.07]" />}
            {(plan === "free" || plan === "basic") && (
              <Link
                href="/checkout?plan=pro"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-300/15 px-2 py-2 text-[11px] font-semibold text-amber-200 transition hover:bg-amber-300/25"
              >
                <Crown className="size-3.5" /> Upgrade to Pro
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 px-5 py-5 text-[10px] text-slate-600 lg:px-6">
            <CircleHelp className="size-3.5" /> Need help?{" "}
            <Link href="/dashboard/help" className="text-slate-400 hover:text-white">
              Contact support
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

      <div className="dashboard-main min-w-0">
        <header className="dashboard-header">
          <div className="flex min-w-0 items-center gap-3">
            {!sidebarOpen && (
              <button className="dashboard-menu" onClick={openSidebar} aria-label="Open navigation">
                <Menu className="size-5" />
              </button>
            )}
            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <Link href="/dashboard" className="cursor-pointer transition hover:text-indigo-600 dark:hover:text-indigo-400">
                Workspace
              </Link>
              <ChevronRight className="size-3" />
              <span className="font-medium text-slate-700 dark:text-slate-300">{headerTitle}</span>
            </div>
            <h1 className="font-display text-base font-semibold text-slate-900 sm:hidden dark:text-white">
              {headerTitleMyanmar}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            {actions ?? (
              <ShopSwitcher />
            )}
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
