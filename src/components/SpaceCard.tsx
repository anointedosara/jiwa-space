"use client";

import Link from "next/link";
import { StarIcon, PinIcon, BedIcon, BathIcon, HeartIcon } from "./icons";
import { formatPrice, type Space } from "@/lib/types";
import { useAuth } from "./AuthProvider";

/** Large popular-spaces card (Home). */
export function SpaceCard({ space }: { space: Space }) {
  const { isFavourite, toggleFavourite } = useAuth();
  const fav = isFavourite(space._id);
  return (
    <Link
      href={`/spaces/${space._id}`}
      className="block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-accent)]/50"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={space.images[0]}
          alt={space.name}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFavourite(space._id);
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
          aria-label="Save"
        >
          <HeartIcon size={18} filled={fav} className={fav ? "text-[var(--color-accent)]" : ""} />
        </button>
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[var(--color-accent)]">
            <span className="text-base font-semibold">
              {formatPrice(space.currency, space.price)}
            </span>{" "}
            <span className="text-xs text-[var(--color-muted)]">
              For 1 Nights
            </span>
          </p>
          <span className="flex items-center gap-1 text-sm text-[var(--color-text)]">
            <StarIcon size={14} className="text-[var(--color-accent)]" />
            {space.rating}
          </span>
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold">{space.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <p className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
            <PinIcon size={13} className="text-[var(--color-accent)]" />
            {space.location}
          </p>
          <p className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
            <span className="flex items-center gap-1">
              <BedIcon size={14} /> {space.beds}
            </span>
            <span className="flex items-center gap-1">
              <BathIcon size={14} /> {space.baths}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Compact card used in horizontal Discover rails. */
export function SpaceCardSmall({ space }: { space: Space }) {
  return (
    <Link
      href={`/spaces/${space._id}`}
      className="block w-44 shrink-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-accent)]/50"
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={space.images[0]}
          alt={space.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="truncate font-display text-sm font-semibold">
          {space.name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">
          {formatPrice(space.currency, space.price)} for 1 Nights
        </p>
        <span className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-text)]">
          <StarIcon size={12} className="text-[var(--color-accent)]" />
          {space.rating}
        </span>
      </div>
    </Link>
  );
}
