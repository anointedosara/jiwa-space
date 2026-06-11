"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SearchIcon, PinIcon, ChevronRight, ChevronLeft } from "@/components/icons";
import { SpaceCardSmall } from "@/components/SpaceCard";
import { Spinner } from "@/components/ui";
import { detectLocation, getStoredLocation, saveLocation } from "@/lib/geo";
import { usePersistedState } from "@/lib/usePersistedState";
import type { Space } from "@/lib/types";

const categories = ["Near You", "Hotel", "Apartment", "Guest House", "Villa"];

export default function DiscoverPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = usePersistedState("discover:category", "Near You");
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    fetch("/api/spaces")
      .then((r) => r.json())
      .then((d) => setSpaces(d.spaces ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Use a previously chosen location, otherwise detect it from the device / IP.
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocationName(stored.name);
      return;
    }
    setLocationName("Detecting your location…");
    detectLocation().then((place) => {
      if (place) {
        setLocationName(place.name);
        saveLocation(place);
      } else {
        setLocationName("East Jakarta, Indonesia");
      }
    });
  }, []);

  const city = locationName.split(",")[0].trim();

  const filtered = useMemo(() => {
    if (category === "Near You") return spaces;
    return spaces.filter((s) => s.type === category);
  }, [spaces, category]);

  const nearCity = filtered.filter(
    (s) => city && (s.city.includes(city) || s.area.includes(city))
  );
  const apartments = filtered.filter((s) => s.type === "Apartment");

  return (
    <main className="screen screen-wide py-4">
      <Link
        href="/discover/location"
        className="flex items-center gap-1 text-sm"
      >
        <span className="text-[var(--color-muted)]">Where To?</span>
      </Link>
      <Link
        href="/discover/location"
        className="mt-1 flex items-center gap-1.5 font-display text-lg font-semibold"
      >
        <PinIcon size={18} className="text-[var(--color-accent)]" />
        {locationName || "Loading…"}
        <ChevronRight size={16} className="text-[var(--color-muted)]" />
      </Link>

      <Link
        href="/search"
        className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-muted)]"
      >
        <SearchIcon size={18} />
        Search Spaces...
      </Link>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm transition ${
              category === c
                ? "bg-[var(--color-accent)] text-[#231310]"
                : "border border-[var(--color-border)] text-[var(--color-muted)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-[var(--color-muted)]">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 space-y-7">
          <Rail
            title={city ? `Places To Stay in ${city}` : "Places Near You"}
            spaces={nearCity.length ? nearCity : filtered.slice(0, 6)}
          />
          <Rail
            title={category === "Near You" ? "Apartments Near You" : `${category}s For You`}
            spaces={apartments.length ? apartments : filtered.slice(0, 6)}
          />
          <Rail title="Recommended For You" spaces={filtered} />
        </div>
      )}
    </main>
  );
}

function Rail({ title, spaces }: { title: string; spaces: Space[] }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const step = el.clientWidth * 0.85;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    const atStart = el.scrollLeft <= 8;
    let left: number;
    if (dir === 1) left = atEnd ? 0 : el.scrollLeft + step;
    else left = atStart ? el.scrollWidth : el.scrollLeft - step;
    el.scrollTo({ left, behavior: "smooth" });
  }

  if (!spaces.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {spaces.map((s) => (
          <SpaceCardSmall key={s._id} space={s} />
        ))}
      </div>
    </section>
  );
}
