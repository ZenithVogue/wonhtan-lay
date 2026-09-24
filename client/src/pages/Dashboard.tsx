import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  Printer,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "Paid" | "Pending" | "Delivered";
type Platform = "Telegram" | "Messenger";

type Order = {
  id: string;
  customer: string;
  initials: string;
  platform: Platform;
  items: string;
  amount: number;
  status: OrderStatus;
  address: string;
  phone: string;
};

const orders: Order[] = [
  { id: "#WH-10428", customer: "May Thu", initials: "MT", platform: "Telegram", items: "Cica Toner × 2", amount: 26000, status: "Paid", address: "No. 18, 4th Street, Sanchaung, Yangon", phone: "09 421 889 220" },
  { id: "#WH-10427", customer: "Htet Aung", initials: "HA", platform: "Messenger", items: "Sunscreen SPF50 × 1", amount: 18500, status: "Pending", address: "No. 72, Insein Road, Hlaing, Yangon", phone: "09 776 342 901" },
  { id: "#WH-10426", customer: "Su Su Wai", initials: "SS", platform: "Telegram", items: "Lip Tint Set × 2", amount: 32000, status: "Delivered", address: "No. 9, Bogyoke Street, Tamwe, Yangon", phone: "09 976 410 188" },
  { id: "#WH-10425", customer: "Nyein Chan", initials: "NC", platform: "Messenger", items: "Moisturizer × 1", amount: 22000, status: "Paid", address: "No. 41, Thiri Street, North Dagon, Yangon", phone: "09 420 127 603" },
  { id: "#WH-10424", customer: "Ei Ei Hlaing", initials: "EH", platform: "Telegram", items: "Cleanser + Toner", amount: 41000, status: "Delivered", address: "No. 125, Pyay Road, Kamayut, Yangon", phone: "09 770 625 440" },
  { id: "#WH-10423", customer: "Thaw Zin", initials: "TZ", platform: "Messenger", items: "Body Lotion × 2", amount: 28000, status: "Pending", address: "No. 5, Kabar Aye Pagoda Road, Mayangone", phone: "09 255 762 211" },
];

const navItems = [
  { label: "Dashboard", burmese: "ပင်မစာမျက်နှာ", icon: LayoutDashboard, active: true },
  { label: "Orders", burmese: "အော်ဒါများ", icon: ClipboardList },
  { label: "Bot Connections", burmese: "Bot ချိတ်ဆက်ရန်", icon: Bot, count: "2" },
  { label: "Products / Menu", burmese: "ပစ္စည်းစာရင်း", icon: ShoppingBag },
  { label: "Settings", burmese: "ဆက်တင်များ", icon: Settings },
];

function formatMMK(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles = {
    Paid: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    Pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    Delivered: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${platform === "Telegram" ? "text-sky-300" : "text-indigo-300"}`}><span className={`flex size-6 items-center justify-center rounded-md ${platform === "Telegram" ? "bg-sky-400/10" : "bg-indigo-400/10"}`}>{platform === "Telegram" ? <SendIcon /> : <MessageIcon />}</span>{platform}</span>;
}

function SendIcon() { return <span className="text-[11px]">➤</span>; }
function MessageIcon() { return <span className="text-[10px]">✦</span>; }

export default function Dashboard() {
  const [mobileNav, setMobileNav] = useState(false);
  const [shopMenu, setShopMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"All" | OrderStatus>("All");
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesFilter = activeFilter === "All" || order.status === activeFilter;
    const normalized = `${order.id} ${order.customer} ${order.items}`.toLowerCase();
    return matchesFilter && normalized.includes(query.toLowerCase());
  }), [activeFilter, query]);

  const chooseNav = (label: string) => {
    setMobileNav(false);
    if (label === "Bot Connections") {
      window.location.href = "/dashboard/bots";
      return;
    }
    if (label !== "Dashboard") toast(`${label} section`, { description: "ဒီ dashboard flow ကို မကြာခင် အသုံးပြုနိုင်ပါမယ်။" });
  };

  return (
    <div className="dashboard-shell min-h-screen bg-[#07111f] text-slate-100">
      <aside className={`dashboard-sidebar ${mobileNav ? "dashboard-sidebar-open" : ""}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5 lg:px-6">
            <a href="/" className="flex items-center gap-3" aria-label="WonHtan Lay home">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-emerald-400 shadow-[0_8px_24px_rgba(78,84,220,0.3)]"><Bot className="size-4 text-white" /></span>
              <span><span className="block font-display text-[15px] font-bold tracking-tight text-white">WonHtan Lay</span><span className="block text-[10px] font-medium tracking-[0.12em] text-slate-500">ဝန်ထမ်းလေး</span></span>
            </a>
            <button className="dashboard-close lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X className="size-4" /></button>
          </div>

          <div className="px-4 pt-5"><div className="dashboard-label px-3">WORKSPACE</div><nav className="mt-3 space-y-1">{navItems.map((item) => { const Icon = item.icon; return <button key={item.label} onClick={() => chooseNav(item.label)} className={`dashboard-nav-item ${item.active ? "dashboard-nav-active" : ""}`}><Icon className="size-[17px] shrink-0" /><span className="min-w-0 flex-1 text-left"><span className="block text-[13px] font-medium">{item.label}</span><span className="mt-0.5 block text-[10px] text-slate-500">{item.burmese}</span></span>{item.count && <span className="rounded-md bg-indigo-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">{item.count}</span>}</button>; })}</nav></div>

          <div className="mx-4 mt-auto rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5"><div className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Store className="size-4" /></span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-white">KPay Verified Shop</span><span className="mt-1 flex items-center gap-1 text-[10px] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-300" /> Pro Plan</span></span><ChevronDown className="ml-auto size-4 text-slate-500" /></div><div className="my-3 h-px bg-white/[0.07]" /><button className="flex w-full items-center gap-2 px-1 text-xs text-slate-500 transition hover:text-white" onClick={() => toast("Logged out", { description: "Demo account မှ ထွက်လိုက်ပါပြီ။" })}><LogOut className="size-3.5" /> Logout</button></div>
          <div className="flex items-center gap-2 px-5 py-5 text-[10px] text-slate-600 lg:px-6"><CircleHelp className="size-3.5" /> Need help? <button className="text-slate-400 hover:text-white" onClick={() => toast("Support", { description: "Support team ကို မကြာခင် ဆက်သွယ်နိုင်ပါမယ်။" })}>Contact support</button></div>
        </div>
      </aside>
      {mobileNav && <button className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay" />}

      <div className="dashboard-main min-w-0">
        <header className="dashboard-header"><div className="flex min-w-0 items-center gap-3"><button className="dashboard-menu lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu className="size-5" /></button><div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span>Workspace</span><ChevronRight className="size-3" /><span className="font-medium text-slate-300">Dashboard</span></div><h1 className="font-display text-base font-semibold text-white sm:hidden">Dashboard</h1></div><div className="ml-auto flex items-center gap-2.5"><div className="relative hidden md:block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="dashboard-search" placeholder="Search orders..." aria-label="Search orders" /></div><button className="dashboard-icon-button relative" onClick={() => toast("You are all caught up", { description: "No new notification right now." })} aria-label="Notifications"><Bell className="size-[17px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-300" /></button><div className="relative"><button className="shop-selector" onClick={() => setShopMenu((value) => !value)}><span className="hidden text-left sm:block"><span className="block text-[10px] text-slate-500">Active shop</span><span className="block max-w-[120px] truncate text-xs font-semibold text-white">KPay Verified Shop</span></span><span className="flex size-8 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300 sm:hidden"><Store className="size-4" /></span><ChevronDown className="size-3.5 text-slate-500" /></button>{shopMenu && <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-white/10 bg-[#102039] p-2 shadow-2xl"><button className="flex w-full items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2.5 text-left text-xs text-white"><span className="size-2 rounded-full bg-emerald-300" />KPay Verified Shop<Check className="ml-auto size-3.5 text-emerald-300" /></button><button onClick={() => toast("Add a new shop", { description: "Multi-shop support is coming soon." })} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white"><Store className="size-3.5" /> Add another shop</button></div>}</div></div></header>

        <main className="dashboard-content">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs text-slate-500"><span>Monday, September 24, 2026</span><span className="size-1 rounded-full bg-slate-600" /><span className="text-emerald-300">Good morning, May</span></div><h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Your shop at a glance<span className="text-indigo-300">.</span></h2><p className="mt-2 text-sm text-slate-500">ဒီနေ့ရဲ့ အော်ဒါနဲ့ လုပ်ဆောင်ချက်တွေကို တစ်နေရာတည်းမှာ ကြည့်ပါ။</p></div><button className="button-primary w-fit" onClick={() => toast("New order", { description: "Order creation form ကို မကြာခင် ထည့်ပေးပါမယ်။" })}><Zap className="size-4" /> New order</button></div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
            { label: "Total orders today", burmese: "ဒီနေ့ အော်ဒါစုစုပေါင်း", value: "48", trend: "+12.5%", icon: ClipboardList, iconStyle: "bg-indigo-400/10 text-indigo-300", trendStyle: "text-emerald-300", note: "vs. yesterday" },
            { label: "Revenue today", burmese: "ဒီနေ့ ဝင်ငွေ", value: "1,248,000", suffix: "MMK", trend: "+8.2%", icon: CreditCard, iconStyle: "bg-emerald-400/10 text-emerald-300", trendStyle: "text-emerald-300", note: "vs. yesterday" },
            { label: "Pending verifications", burmese: "စစ်ဆေးရန်ကျန် စလစ်", value: "7", trend: "Needs attention", icon: FileCheck2, iconStyle: "bg-amber-400/10 text-amber-300", trendStyle: "text-amber-300", note: "right now" },
            { label: "Active bots", burmese: "ချိတ်ဆက်ထားသော Bot", value: "2", trend: "All systems live", icon: Bot, iconStyle: "bg-cyan-400/10 text-cyan-300", trendStyle: "text-cyan-300", note: "Telegram + Messenger" },
          ].map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="dashboard-stat-card"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-slate-400">{stat.label}</p><p className="mt-1 text-[10px] text-slate-600">{stat.burmese}</p></div><span className={`flex size-9 items-center justify-center rounded-xl ${stat.iconStyle}`}><Icon className="size-4" /></span></div><div className="mt-6 flex items-baseline gap-2"><span className="font-display text-2xl font-bold tracking-tight text-white">{stat.value}</span>{stat.suffix && <span className="text-xs font-semibold text-slate-500">{stat.suffix}</span>}</div><div className="mt-3 flex items-center gap-1.5 text-[10px]"><span className={`flex items-center gap-1 font-semibold ${stat.trendStyle}`}>{stat.trend.includes("%") ? <ArrowUpRight className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}{stat.trend}</span><span className="text-slate-600">{stat.note}</span></div></article>; })}</section>

          <section className="dashboard-panel mt-6"><div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h3 className="font-display text-base font-semibold text-white">Recent orders</h3><p className="mt-1 text-xs text-slate-500">လတ်တလော ဝင်လာတဲ့ အော်ဒါများ</p></div><div className="flex items-center gap-2"><div className="relative md:hidden"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="dashboard-search dashboard-search-mobile" placeholder="Search" aria-label="Search orders" /></div><button className="dashboard-filter-button" onClick={() => toast("Export orders", { description: "CSV export ကို မကြာခင် အသုံးပြုနိုင်ပါမယ်။" })}><Download className="size-3.5" /><span className="hidden sm:inline">Export</span></button></div></div><div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.08] px-5 py-3 sm:px-6">{(["All", "Paid", "Pending", "Delivered"] as const).map((filter) => <button key={filter} onClick={() => { setActiveFilter(filter); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${activeFilter === filter ? "bg-white/[0.08] text-white" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"}`}>{filter}{filter === "All" && <span className="ml-1.5 text-[10px] text-slate-600">48</span>}</button>)}</div><div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Platform</th><th>Items</th><th>Total amount</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id}><td><span className="font-mono text-xs font-medium text-indigo-300">{order.id}</span><span className="mt-1 block text-[10px] text-slate-600">Today, 10:42 AM</span></td><td><span className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-[10px] font-bold text-slate-200">{order.initials}</span><span className="text-xs font-medium text-slate-200">{order.customer}</span></span></td><td><PlatformBadge platform={order.platform} /></td><td><span className="max-w-[155px] truncate text-xs text-slate-400">{order.items}</span></td><td><span className="text-xs font-semibold text-slate-200">{formatMMK(order.amount)} <span className="text-[10px] text-slate-500">MMK</span></span></td><td><StatusBadge status={order.status} /></td><td><button className="order-action" onClick={() => setSelectedOrder(order)}>View delivery slip <ArrowUpRight className="size-3.5" /></button></td></tr>)}</tbody></table>{filteredOrders.length === 0 && <div className="px-6 py-14 text-center"><Search className="mx-auto size-7 text-slate-600" /><p className="mt-3 text-sm text-slate-400">No matching orders</p><button onClick={() => { setQuery(""); setActiveFilter("All"); }} className="mt-2 text-xs text-indigo-300 hover:text-indigo-200">Clear filters</button></div>}</div><div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4 sm:px-6"><span className="text-[11px] text-slate-600">Showing <span className="text-slate-400">{filteredOrders.length ? 1 : 0}-{filteredOrders.length}</span> of 48 orders</span><div className="flex items-center gap-1"><button className="pagination-button" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft className="size-3.5" /></button><button className="pagination-button pagination-active">{page}</button><button className="pagination-button" onClick={() => setPage(page + 1)}>2</button><button className="pagination-button" onClick={() => setPage(page + 1)}><ChevronRight className="size-3.5" /></button></div></div></section>
        </main>
      </div>

      {selectedOrder && <DeliverySlipModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

function DeliverySlipModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Delivery slip"><div className="delivery-modal w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1b2d] shadow-2xl"><div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4"><div><h2 className="font-display text-sm font-semibold text-white">Delivery slip preview</h2><p className="mt-0.5 text-[11px] text-slate-500">{order.id} · Ready to print</p></div><button className="dashboard-icon-button" onClick={onClose} aria-label="Close delivery slip"><X className="size-4" /></button></div><div className="max-h-[calc(100vh-190px)] overflow-y-auto p-4 sm:p-6"><div className="receipt-paper rounded-xl bg-white p-6 text-slate-800 shadow-xl sm:p-8"><div className="flex items-start justify-between border-b-2 border-slate-800 pb-5"><div><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white"><Bot className="size-4" /></span><span className="font-display text-lg font-bold text-slate-900">WonHtan Lay</span></div><p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Delivery waybill</p></div><div className="text-right"><p className="font-mono text-sm font-bold text-slate-900">{order.id}</p><p className="mt-1 text-[10px] text-slate-500">24 Sep 2026 · 10:42 AM</p></div></div><div className="grid gap-5 border-b border-dashed border-slate-300 py-5 sm:grid-cols-2"><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Deliver to</p><p className="mt-2 text-sm font-bold text-slate-900">{order.customer}</p><p className="mt-1 text-xs leading-5 text-slate-600">{order.address}</p><p className="mt-1 text-xs font-medium text-slate-700">{order.phone}</p></div><div className="sm:text-right"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Payment status</p><p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><Check className="size-3" /> {order.status === "Pending" ? "Awaiting verification" : "KPay verified"}</p><p className="mt-3 text-[10px] text-slate-500">Via {order.platform}</p></div></div><div className="py-5"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Items</p><div className="mt-3 flex items-center justify-between border-b border-slate-200 pb-3 text-xs"><span className="font-medium text-slate-700">{order.items}</span><span className="font-bold text-slate-900">{formatMMK(order.amount - 2000)} MMK</span></div><div className="flex items-center justify-between py-3 text-xs text-slate-600"><span>Delivery fee</span><span>2,000 MMK</span></div><div className="flex items-center justify-between border-t border-slate-800 pt-3 text-sm font-bold text-slate-900"><span>Total</span><span>{formatMMK(order.amount)} MMK</span></div></div><div className="flex items-end justify-between border-t border-dashed border-slate-300 pt-5"><div><div className="qr-placeholder"><span /><span /><span /><span /></div><p className="mt-2 text-[9px] text-slate-400">Scan to track order</p></div><div className="text-right"><Truck className="ml-auto size-6 text-indigo-600" /><p className="mt-2 text-[10px] font-semibold text-slate-500">Thank you for shopping with us.</p><p className="text-[10px] text-slate-400">ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါတယ်။</p></div></div></div></div><div className="flex items-center justify-end gap-2 border-t border-white/[0.08] px-5 py-4"><button className="dashboard-filter-button" onClick={() => toast("Download started", { description: "Delivery slip PDF သည် demo mode ဖြစ်ပါသည်။" })}><Download className="size-3.5" /> Download PDF</button><button className="button-primary h-10 px-4 text-xs" onClick={() => toast("Print ready", { description: "Your delivery slip is ready to print." })}><Printer className="size-3.5" /> Print slip</button></div></div></div>;
}
