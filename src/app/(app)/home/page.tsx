"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogoWord } from "@/components/Logo";
import { BellIcon, SearchIcon, ArrowUpRight } from "@/components/icons";
import { SpaceCard, SpaceCardSmall } from "@/components/SpaceCard";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { usePersistedState } from "@/lib/usePersistedState";
import type { Space } from "@/lib/types";

const heroSlides = [
  {
    tag: "Unique",
    title: "Find Something\nSpecial",
    image:
      "https://images.unsplash.com/photo-1486304873000-235643847519?auto=format&fit=crop&w=1200&q=75",
  },
  {
    tag: "Hot",
    title: "Find Popular\nSpaces",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=75",
  },
];

const categories = ["Near You", "Hotel", "Apartment", "Villa", "Guest House"];

export default function HomePage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState(0);
  const [category, setCategory] = usePersistedState("home:category", "Near You");
  const [unread, setUnread] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/spaces")
      .then((r) => r.json())
      .then((d) => setSpaces(d.spaces ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Show the bell signal only when there are unread notifications, and keep it
  // current when a new one is added or the tab regains focus.
  useEffect(() => {
    const refresh = () =>
      fetch("/api/notifications", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setUnread(d.unread ?? 0))
        .catch(() => {});
    refresh();
    window.addEventListener("jiva:notify", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("jiva:notify", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const filtered = useMemo(
    () =>
      category === "Near You"
        ? spaces
        : spaces.filter((s) => s.type === category),
    [spaces, category]
  );
  const popular = filtered.filter((s) => s.popular);
  const others = filtered.filter((s) => !s.popular);
  const favIds = user?.favourites ?? [];
  const saved = spaces.filter((s) => favIds.includes(s._id));

  return (
    <main className="screen screen-wide py-4 lg:py-6">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4">
        <LogoWord size={18} markSize={22} />

        {/* Inline search on desktop */}
        <Link
          href="/search"
          className="hidden flex-1 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)]/50 lg:flex lg:max-w-md"
        >
          <SearchIcon size={18} />
          Search Spaces...
        </Link>

        <Link
          href="/notifications"
          className="relative text-[var(--color-text)]"
          aria-label="Notifications"
        >
          <BellIcon />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-semibold text-[#231310]">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </header>

      {/* Search on mobile */}
      <Link
        href="/search"
        className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-muted)] lg:hidden"
      >
        <SearchIcon size={18} />
        Search Spaces...
      </Link>

      {/* Hero: carousel on mobile, two feature banners on desktop */}
      <div className="mt-4 lg:hidden">
        <HeroBanner slide={heroSlides[hero]} onTap={() => setHero((h) => (h + 1) % heroSlides.length)} />
        <div className="mt-3 flex justify-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setHero(i)}
              className={`h-2 rounded-full transition-all ${
                i === hero ? "w-5 bg-[var(--color-accent)]" : "w-2 bg-[var(--color-border)]"
              }`}
              aria-label={`Hero ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-5 hidden gap-5 lg:grid lg:grid-cols-2">
        {heroSlides.map((slide) => (
          <HeroBanner key={slide.tag} slide={slide} tall />
        ))}
      </div>

      {/* Saved places */}
      {saved.length > 0 && (
        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold">Saved Places</h2>
            <span className="text-sm text-[var(--color-muted)]">
              {saved.length} saved
            </span>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {saved.map((s) => (
              <SpaceCardSmall key={s._id} space={s} />
            ))}
          </div>
        </section>
      )}

      {/* Category filter */}
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm transition ${
              category === c
                ? "bg-[var(--color-accent)] text-[#231310]"
                : "border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-[var(--color-muted)]">
          <Spinner />
        </div>
      ) : (
        <>
          {popular.length > 0 && (
            <Section title="Popular Spaces" count={popular.length} spaces={popular} />
          )}
          {others.length > 0 && (
            <Section
              title={category === "Near You" ? "Explore More Spaces" : `More ${category}s`}
              count={others.length}
              spaces={others}
            />
          )}
          {filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-[var(--color-muted)]">
              No spaces in this category yet.
            </p>
          )}
        </>
      )}
    </main>
  );
}

function Section({
  title,
  count,
  spaces,
}: {
  title: string;
  count: number;
  spaces: Space[];
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <span className="text-sm text-[var(--color-muted)]">{count} places</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {spaces.map((space) => (
          <SpaceCard key={space._id} space={space} />
        ))}
      </div>
    </section>
  );
}

function HeroBanner({
  slide,
  tall,
  onTap,
}: {
  slide: (typeof heroSlides)[number];
  tall?: boolean;
  onTap?: () => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onClick={onTap}
      role={onTap ? "button" : undefined}
    >
      <div className={`relative w-full ${tall ? "aspect-[16/8]" : "aspect-[16/9]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slide.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/65 via-black/20 to-transparent" />
        <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
          {slide.tag}
        </div>
        <h2 className="absolute right-5 top-1/2 -translate-y-1/2 whitespace-pre-line text-right font-display text-2xl font-semibold text-white lg:text-3xl">
          {slide.title}
        </h2>
        <Link
          href="/discover"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-accent)] text-[#231310]"
          aria-label="Explore"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
