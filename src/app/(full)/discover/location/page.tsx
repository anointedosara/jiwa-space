"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { ChevronLeft, SearchIcon, PinIcon } from "@/components/icons";
import { SpaceCardSmall } from "@/components/SpaceCard";
import { Button, Spinner } from "@/components/ui";
import { loadLeaflet } from "@/lib/leaflet-loader";
import {
  DEFAULT_PLACE,
  forwardGeocode,
  getStoredLocation,
  reverseGeocode,
  saveLocation,
  type GeoPlace,
} from "@/lib/geo";
import type { Space } from "@/lib/types";

export default function LocationPage() {
  const router = useRouter();
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [place, setPlace] = useState<GeoPlace>(
    () => getStoredLocation() ?? DEFAULT_PLACE
  );
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [ready, setReady] = useState(false);

  // Fetch the spaces that match a place (by city / area keyword).
  async function loadData(name: string) {
    const keyword = name.split(",")[0].trim();
    setLoadingData(true);
    try {
      const res = await fetch(`/api/spaces?q=${encodeURIComponent(keyword)}`);
      const d = await res.json();
      setSpaces(d.spaces ?? []);
    } catch {
      setSpaces([]);
    } finally {
      setLoadingData(false);
    }
  }

  // Move the marker + recenter, reverse-geocode, and refresh the location data.
  async function selectPoint(lat: number, lon: number, knownName?: string) {
    const L = (window as any).L;
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      mapRef.current.panTo([lat, lon]);
    }
    void L;
    const name = knownName ?? (await reverseGeocode(lat, lon));
    const next = { name, lat, lon };
    setPlace(next);
    loadData(name);
  }

  // Initialise the interactive map once.
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapEl.current || mapRef.current) return;
        const map = L.map(mapEl.current, {
          zoomControl: true,
          scrollWheelZoom: true, // wheel zooms the map instead of scrolling the page
        }).setView([place.lat, place.lon], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);

        const marker = L.circleMarker([place.lat, place.lon], {
          radius: 10,
          color: "#e8836b",
          fillColor: "#e8836b",
          fillOpacity: 0.9,
          weight: 3,
        }).addTo(map);

        map.on("click", (e: any) => {
          selectPoint(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        markerRef.current = marker;
        setReady(true);
        setTimeout(() => map.invalidateSize(), 200);
      })
      .catch(() => setError("Map failed to load. Check your connection."));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial data for the starting place.
  useEffect(() => {
    loadData(place.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError("");
    try {
      const found = await forwardGeocode(q);
      if (!found) {
        setError("Couldn't find that place. Try another search.");
        return;
      }
      if (mapRef.current) mapRef.current.setView([found.lat, found.lon], 12);
      selectPoint(found.lat, found.lon, found.name);
    } finally {
      setSearching(false);
    }
  }

  function confirm() {
    saveLocation(place);
    router.back();
  }

  return (
    <main className="screen screen-wide py-4">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Back" className="text-[var(--color-accent)]">
          <ChevronLeft />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2 pr-6">
          <LogoMark size={20} />
          <span className="font-display text-lg font-semibold">Where To?</span>
        </div>
      </header>

      <form
        onSubmit={search}
        className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-accent)]/50 bg-[var(--color-surface)] px-4 py-3"
      >
        <SearchIcon size={18} className="text-[var(--color-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Click the map or search here..."
          className="w-full bg-transparent text-sm outline-none"
        />
        {searching && <Spinner size={16} />}
      </form>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      <div className="mt-3 lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-5">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <div
            ref={mapEl}
            className="h-[46vh] w-full overscroll-contain lg:h-[60vh]"
            style={{ touchAction: "none" }}
          />
          {!ready && !error && (
            <div className="absolute inset-0 grid place-items-center bg-[var(--color-surface)] text-[var(--color-muted)]">
              <Spinner />
            </div>
          )}
        </div>

        {/* Selected place + its spaces */}
        <div className="mt-4 lg:mt-0">
          <div className="flex items-start gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <PinIcon size={20} className="mt-0.5 text-[var(--color-accent)]" />
            <div>
              <p className="text-xs text-[var(--color-muted)]">Selected location</p>
              <p className="font-medium">{place.name}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">
              Spaces around here
            </h2>
            <span className="text-sm text-[var(--color-muted)]">
              {spaces.length} found
            </span>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-8 text-[var(--color-muted)]">
              <Spinner />
            </div>
          ) : spaces.length > 0 ? (
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {spaces.slice(0, 6).map((s) => (
                <SpaceCardSmall key={s._id} space={s} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              No spaces listed here yet — try a nearby city like Jakarta, Bali or
              Bandung.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-md">
        <Button onClick={confirm}>Set Location</Button>
        <Button variant="outline" onClick={() => selectPoint(DEFAULT_PLACE.lat, DEFAULT_PLACE.lon, DEFAULT_PLACE.name)}>
          Reset Location
        </Button>
      </div>
    </main>
  );
}
