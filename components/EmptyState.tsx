import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Cta = { label: string; href?: string; onClick?: () => void };

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  primary?: Cta;
  secondary?: Cta;
  /** Smaller padding for use inside tables / panels. */
  compact?: boolean;
};

const primaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95";
const secondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 active:scale-95 dark:border-slate-600 dark:text-slate-300 dark:hover:text-indigo-300";

function CtaButton({ cta, className }: { cta: Cta; className: string }) {
  if (cta.href) {
    return (
      <Link href={cta.href} className={className}>
        {cta.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={cta.onClick} className={className}>
      {cta.label}
    </button>
  );
}

/** Friendly empty state with Burmese call-to-action buttons. */
export default function EmptyState({ icon: Icon, title, description, primary, secondary, compact }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? "px-6 py-12" : "rounded-2xl border border-dashed border-slate-300 px-6 py-16 dark:border-slate-700"}`}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
        <Icon className="size-7" />
      </span>
      <p className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-600 dark:text-slate-400">{description}</p>}
      {(primary || secondary) && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {primary && <CtaButton cta={primary} className={primaryClass} />}
          {secondary && <CtaButton cta={secondary} className={secondaryClass} />}
        </div>
      )}
    </div>
  );
}
