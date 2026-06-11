"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

/**
 * State that persists to localStorage, namespaced by the signed-in user so each
 * person keeps their own saved UI state (selected dates, filters, etc.).
 *
 * Restore happens in an effect (after auth resolves) and never writes back, so
 * it can't clobber a saved value; writes happen only through the returned
 * setter. Returns the current value and a setter that also persists.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const { user, loading } = useAuth();
  const ns = `jiva:${user?.id ?? "guest"}:${key}`;
  const [value, setValue] = useState<T>(initial);
  const ready = useRef(false);

  useEffect(() => {
    if (loading) return;
    ready.current = false;
    try {
      const raw = localStorage.getItem(ns);
      setValue(raw != null ? (JSON.parse(raw) as T) : initial);
    } catch {
      setValue(initial);
    }
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ns, loading]);

  const set = useCallback(
    (next: T) => {
      setValue(next);
      if (ready.current) {
        try {
          localStorage.setItem(ns, JSON.stringify(next));
        } catch {
          /* ignore quota / availability */
        }
      }
    },
    [ns]
  );

  return [value, set] as const;
}
