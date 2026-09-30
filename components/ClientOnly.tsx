"use client";

import { Bot } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Renders children only after the component has mounted in the browser.
 *
 * Why: browser extensions / preview tooling that stamp extra attributes onto
 * every DOM element before React hydrates (e.g. `bis_size`, `bis_frame_id`)
 * trigger React 19 hydration mismatch errors. Gating app content behind the
 * mount means there is no server-rendered content to mismatch against — the
 * page subtree renders purely on the client and stays immune to any
 * pre-hydration DOM mutation.
 */
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950">
        <span className="flex size-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-emerald-400">
          <Bot className="size-6 text-white" />
        </span>
        <p className="text-sm font-medium text-slate-400">Loading WonHtan Lay…</p>
      </div>
    );
  }

  return <>{children}</>;
}
