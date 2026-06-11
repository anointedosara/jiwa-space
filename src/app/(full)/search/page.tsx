"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { ChevronLeft, SearchIcon, PinIcon, SendIcon } from "@/components/icons";
import { Spinner } from "@/components/ui";
import { formatPrice, type Space } from "@/lib/types";

export default function SearchPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setTouched(false);
      return;
    }
    setTouched(true);
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/spaces?q=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.spaces ?? []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <main className="screen screen-wide py-4">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Back">
          <ChevronLeft />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2 pr-6">
          <LogoMark size={20} />
          <span className="font-display text-lg font-semibold">Search</span>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-surface)] px-4 py-3">
        <SearchIcon size={18} className="text-[var(--color-muted)]" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for hotels, cities, villas..."
          className="w-full bg-transparent text-sm outline-none"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear" className="text-[var(--color-muted)]">
            ✕
          </button>
        )}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-12 text-[var(--color-muted)]">
            <Spinner />
          </div>
        ) : results.length > 0 ? (
          <ul className="divide-y divide-[var(--color-border)]">
            {results.map((s) => (
              <li key={s._id}>
                <Link href={`/spaces/${s._id}`} className="flex items-center gap-3 py-3.5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--color-surface)] text-[var(--color-accent)]">
                    <PinIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{s.name}</p>
                    <p className="truncate text-sm text-[var(--color-muted)]">
                      {s.location} · {formatPrice(s.currency, s.price)}
                    </p>
                  </div>
                  <SendIcon size={18} className="text-[var(--color-accent)]" />
                </Link>
              </li>
            ))}
          </ul>
        ) : touched ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-[var(--color-accent)] text-[var(--color-accent)]">
              <SearchIcon size={32} />
            </div>
            <h2 className="mt-5 font-display text-xl font-semibold">
              The Place Dosent Exist
            </h2>
            <p className="mt-1 max-w-xs text-sm text-[var(--color-muted)]">
              Try searching a different keywords for the best results.
            </p>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-[var(--color-muted)]">
            Start typing to find your next space.
          </p>
        )}
      </div>
    </main>
  );
}
