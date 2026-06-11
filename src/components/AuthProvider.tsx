"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Profile } from "@/lib/types";

const CACHE_KEY = "jiva_user";

type AuthState = {
  user: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: Profile | null) => void;
  logout: () => Promise<void>;
  isFavourite: (spaceId: string) => boolean;
  toggleFavourite: (spaceId: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function readCache(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

function writeCache(user: Profile | null) {
  try {
    if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore quota/availability errors */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Hydrate optimistically from the browser cache so the UI shows the signed-in
  // user instantly, then reconcile with the server session.
  const [user, setUserState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: Profile | null) => {
    setUserState(next);
    writeCache(next);
  }, []);

  useEffect(() => {
    setUserState(readCache());
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      // Keep the cached user if the network is unavailable.
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, [setUser]);

  const isFavourite = useCallback(
    (spaceId: string) => Boolean(user?.favourites?.includes(spaceId)),
    [user]
  );

  const toggleFavourite = useCallback(
    async (spaceId: string) => {
      if (!user) return;
      // Optimistic update + cache, then confirm with the server.
      const current = new Set(user.favourites ?? []);
      if (current.has(spaceId)) current.delete(spaceId);
      else current.add(spaceId);
      setUser({ ...user, favourites: [...current] });
      try {
        const res = await fetch("/api/favourites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spaceId }),
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ ...user, favourites: data.favourites });
          if (data.saved && typeof window !== "undefined") {
            // A notification was created server-side — let listeners refresh.
            window.dispatchEvent(new Event("jiva:notify"));
          }
        }
      } catch {
        /* keep optimistic state */
      }
    },
    [user, setUser]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refresh,
        setUser,
        logout,
        isFavourite,
        toggleFavourite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
