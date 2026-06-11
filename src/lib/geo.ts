"use client";

export type GeoPlace = { name: string; lat: number; lon: number };

const KEY = "jiva_location";

export const DEFAULT_PLACE: GeoPlace = {
  name: "East Jakarta, Indonesia",
  lat: -6.2251,
  lon: 106.9004,
};

export function getStoredLocation(): GeoPlace | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GeoPlace) : null;
  } catch {
    return null;
  }
}

export function saveLocation(place: GeoPlace) {
  try {
    localStorage.setItem(KEY, JSON.stringify(place));
  } catch {
    /* ignore */
  }
}

/** Short "City, Country" label from a set of coordinates. */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=12&lat=${lat}&lon=${lon}`,
      { headers: { Accept: "application/json" } }
    );
    const d = await res.json();
    const a = d.address ?? {};
    const city =
      a.city || a.town || a.village || a.county || a.state_district || a.state;
    const label = [city, a.country].filter(Boolean).join(", ");
    return label || (d.display_name?.split(",").slice(0, 2).join(", ") ?? "Selected location");
  } catch {
    return "Selected location";
  }
}

export async function forwardGeocode(query: string): Promise<GeoPlace | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        query
      )}`,
      { headers: { Accept: "application/json" } }
    );
    const d = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;
    if (!d.length) return null;
    const top = d[0];
    return {
      name: top.display_name.split(",").slice(0, 2).join(", "),
      lat: parseFloat(top.lat),
      lon: parseFloat(top.lon),
    };
  } catch {
    return null;
  }
}

/** Detect the user's location: precise browser geolocation, falling back to IP. */
export async function detectLocation(): Promise<GeoPlace | null> {
  const precise = await new Promise<GeoPlace | null>((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return resolve(null);
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const name = await reverseGeocode(latitude, longitude);
        resolve({ name, lat: latitude, lon: longitude });
      },
      () => resolve(null),
      { timeout: 8000, maximumAge: 600000 }
    );
  });
  if (precise) return precise;

  try {
    const res = await fetch("https://ipapi.co/json/");
    const d = await res.json();
    if (d && typeof d.latitude === "number") {
      return {
        name: [d.city, d.country_name].filter(Boolean).join(", "),
        lat: d.latitude,
        lon: d.longitude,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}
