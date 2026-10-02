"use client";

import { SEARCH_HANDOFF_EVENT, takeSearchHandoff, type SearchScope } from "@/lib/search-handoff";
import { useEffect } from "react";

/** Applies a search term sent from the global command palette to a page's search box. */
export function useSearchHandoff(scope: SearchScope, apply: (query: string) => void): void {
  useEffect(() => {
    const consume = () => {
      const query = takeSearchHandoff(scope);
      if (query !== null) apply(query);
    };
    consume();
    window.addEventListener(SEARCH_HANDOFF_EVENT, consume);
    return () => window.removeEventListener(SEARCH_HANDOFF_EVENT, consume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
}
