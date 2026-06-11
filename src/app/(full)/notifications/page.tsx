"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import {
  ChevronLeft,
  StarIcon,
  ChatIcon,
  HeartIcon,
  BellIcon,
} from "@/components/icons";
import { Spinner } from "@/components/ui";
import type { AppNotification } from "@/lib/types";

const iconFor: Record<string, React.ReactNode> = {
  discount: <DiscountIcon />,
  star: <StarIcon size={20} />,
  chat: <ChatIcon size={20} />,
  heart: <HeartIcon size={20} />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setItems(d.notifications ?? []))
      .finally(() => setLoading(false));
    // Opening the page clears the unread signal.
    fetch("/api/notifications", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <main className="screen screen-wide py-4">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Back">
          <ChevronLeft />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2 pr-6">
          <LogoMark size={20} />
          <span className="font-display text-lg font-semibold">Notifications</span>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-12 text-[var(--color-muted)]">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-[var(--color-accent)]/40 text-[var(--color-accent)]">
            <BellIcon size={32} />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold">
            No notifications yet
          </h2>
          <p className="mt-1 max-w-xs text-sm text-[var(--color-muted)]">
            As you book stays, save spaces and explore, your updates will show up
            here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {items.map((n) => (
            <li key={n._id} className="flex gap-3 py-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-accent)]">
                {iconFor[n.icon] ?? <StarIcon size={20} />}
              </div>
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="mt-0.5 text-sm text-[var(--color-muted)]">{n.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function DiscountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 15 15 9" />
      <circle cx="9.5" cy="9.5" r="1.5" />
      <circle cx="14.5" cy="14.5" r="1.5" />
      <path d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" />
    </svg>
  );
}
