"use client";

import { QUICK_ACTION_EVENT, takeQuickAction, type QuickAction } from "@/lib/quick-action";
import { useEffect } from "react";

/** Runs `run` when the header "+ New" menu requests `action` (on mount or while the page is open). */
export function useQuickAction(action: QuickAction, run: () => void): void {
  useEffect(() => {
    const consume = () => {
      if (takeQuickAction(action)) run();
    };
    consume();
    window.addEventListener(QUICK_ACTION_EVENT, consume);
    return () => window.removeEventListener(QUICK_ACTION_EVENT, consume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);
}
