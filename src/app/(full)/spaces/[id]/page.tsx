"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShareIcon,
  DotsIcon,
  StarIcon,
  PinIcon,
  ChevronRight,
  HeartIcon,
  BedIcon,
  BathIcon,
  UserIcon,
  CheckIcon,
} from "@/components/icons";
import { Button, Spinner } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import { formatPrice, type Space } from "@/lib/types";

const SAMPLE_REVIEWS = [
  { name: "Sarah Lestari", avatar: "1438761681033-6461ffad8d80", rating: 5, text: "Absolutely stunning space. Spotless, great location and the host was so responsive. Would book again in a heartbeat." },
  { name: "Michael Rahman", avatar: "1506794778202-cad84cf45f1d", rating: 5, text: "Exactly as pictured. Comfortable beds, fast wifi and a calm neighbourhood. Perfect for a weekend getaway." },
  { name: "Kenzie Williams", avatar: "1507003211169-0a1dd7228f2d", rating: 4, text: "Lovely stay overall. Check-in was smooth and the amenities were great. Only wish the kitchen was a little bigger." },
];

const THINGS_TO_KNOW = [
  { title: "House rules", items: ["Check-in after 2:00 PM", "Checkout before 11:00 AM", "No smoking indoors", "No parties or events"] },
  { title: "Safety & property", items: ["Smoke alarm installed", "Carbon monoxide alarm", "Security cameras on property exterior"] },
  { title: "Cancellation policy", items: ["Free cancellation for 48 hours", "Full refund up to 5 days before check-in", "Review the full policy before booking"] },
];

export default function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isFavourite, toggleFavourite } = useAuth();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch(`/api/spaces/${id}`)
      .then((r) => r.json())
      .then((d) => setSpace(d.space ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  async function copyLink() {
    setMenuOpen(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Couldn't copy the link");
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: space?.name,
          text: `Check out ${space?.name} on Jiva Space`,
          url,
        });
        return;
      } catch {
        return; // user dismissed the share sheet
      }
    }
    copyLink();
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--color-muted)]">
        <Spinner />
      </div>
    );
  }
  if (!space) {
    return (
      <div className="screen screen-narrow py-10 text-center text-[var(--color-muted)]">
        Space not found.
      </div>
    );
  }

  const fav = isFavourite(space._id);
  const title = space.description.split(".")[0];

  return (
    <main className="flex flex-1 flex-col pb-28 lg:pb-12">
      <div className="screen screen-wide">
        <header className="flex items-center justify-between py-3">
          <button onClick={() => router.back()} aria-label="Back" className="text-[var(--color-accent)]">
            <ChevronLeft />
          </button>
          <div className="flex items-center gap-4 text-[var(--color-text)]">
            <button
              onClick={() => {
                toggleFavourite(space._id);
                showToast(fav ? "Removed from saved" : "Saved to your list");
              }}
              aria-label="Save"
              className={fav ? "text-[var(--color-accent)]" : ""}
            >
              <HeartIcon size={20} filled={fav} />
            </button>
            <button onClick={handleShare} aria-label="Share">
              <ShareIcon size={20} />
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} aria-label="More">
                <DotsIcon size={20} />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-8 z-40 w-44 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] py-1 text-sm shadow-xl">
                    <button onClick={copyLink} className="block w-full px-4 py-2.5 text-left hover:bg-[var(--color-surface)]">
                      Copy link
                    </button>
                    <button
                      onClick={() => {
                        toggleFavourite(space._id);
                        setMenuOpen(false);
                        showToast(fav ? "Removed from saved" : "Saved to your list");
                      }}
                      className="block w-full px-4 py-2.5 text-left hover:bg-[var(--color-surface)]"
                    >
                      {fav ? "Remove from saved" : "Save space"}
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        showToast("Thanks — report received");
                      }}
                      className="block w-full px-4 py-2.5 text-left hover:bg-[var(--color-surface)]"
                    >
                      Report listing
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {toast && (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[var(--color-surface-2)] px-4 py-2 text-sm shadow-lg ring-1 ring-[var(--color-border)] animate-fade-in">
            {toast}
          </div>
        )}

        {/* Two-column on desktop: gallery left, details right */}
        <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-10">
          {/* Gallery */}
          <div className="lg:sticky lg:top-4">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="relative aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={space.images[active]}
                  alt={space.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-1 text-xs text-white">
                  {active + 1} / {space.images.length}
                </span>
              </div>
            </div>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {space.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === active ? "border-[var(--color-accent)]" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mt-5 lg:mt-0">
            <span className="inline-block rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-muted)]">
              {space.type}
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold leading-snug lg:text-3xl">
              {title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <StarIcon size={15} className="text-[var(--color-accent)]" />
              <span className="font-medium">{space.rating}</span>
              <span className="text-[var(--color-muted)]">· {space.reviews} Reviews</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <PinIcon size={15} className="text-[var(--color-accent)]" />
              {space.location}
            </p>

            {/* Host */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={space.hostLogo}
                alt={space.hostName}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">Hosted by {space.hostName}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  Superhost · Responds within an hour
                </p>
              </div>
              <ChevronRight size={18} className="text-[var(--color-muted)]" />
            </div>

            {/* Quick facts */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Fact icon={<UserIcon size={20} />} label="Guests" value={space.guests} />
              <Fact icon={<BedIcon size={20} />} label="Bedrooms" value={space.bedrooms} />
              <Fact icon={<BedIcon size={20} />} label="Beds" value={space.beds} />
              <Fact icon={<BathIcon size={20} />} label="Baths" value={space.baths} />
            </div>

            {/* Description */}
            <Section title="About this space">
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                {space.description}
              </p>
            </Section>

            {/* Amenities */}
            <Section title="What this place offers">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {space.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                    <CheckIcon size={16} className="text-[var(--color-accent)]" />
                    {a}
                  </span>
                ))}
              </div>
            </Section>

            {/* Reviews */}
            <Section title={`${space.rating} · ${space.reviews} Reviews`}>
              <div className="space-y-4">
                {SAMPLE_REVIEWS.map((r) => (
                  <div key={r.name} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://images.unsplash.com/photo-${r.avatar}?auto=format&fit=crop&w=120&q=70`}
                        alt={r.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        <div className="flex gap-0.5 text-[var(--color-accent)]">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <StarIcon key={i} size={12} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Things to know */}
            <Section title="Things to know">
              <div className="grid gap-5 sm:grid-cols-3">
                {THINGS_TO_KNOW.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-sm font-semibold">{group.title}</h3>
                    <ul className="mt-2 space-y-1.5">
                      {group.items.map((item) => (
                        <li key={item} className="text-xs leading-relaxed text-[var(--color-muted)]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            {/* Desktop reserve card */}
            <div className="mt-6 hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:block">
              <div className="flex items-end justify-between">
                <p>
                  <span className="text-2xl font-semibold text-[var(--color-text)]">
                    {formatPrice(space.currency, space.price)}
                  </span>
                  <span className="text-sm text-[var(--color-muted)]"> / night</span>
                </p>
                <span className="flex items-center gap-1 text-sm">
                  <StarIcon size={14} className="text-[var(--color-accent)]" />
                  {space.rating} · {space.reviews} reviews
                </span>
              </div>
              <div className="mt-4">
                <Button onClick={() => router.push(`/spaces/${space._id}/book`)}>
                  Reserve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky reserve bar — mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/95 backdrop-blur lg:hidden">
        <div className="screen screen-wide flex items-center justify-between gap-4 py-3">
          <p>
            <span className="text-lg font-semibold text-[var(--color-text)]">
              {formatPrice(space.currency, space.price)}
            </span>
            <span className="text-sm text-[var(--color-muted)]"> / night</span>
          </p>
          <Button
            fullWidth={false}
            className="px-10"
            onClick={() => router.push(`/spaces/${space._id}/book`)}
          >
            Reserve
          </Button>
        </div>
      </div>
    </main>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 text-[var(--color-accent)]">
      {icon}
      <span className="text-lg font-semibold text-[var(--color-text)]">{value}</span>
      <span className="text-xs text-[var(--color-muted)]">{label}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border-t border-[var(--color-border)] pt-5">
      <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
