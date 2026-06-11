"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { SearchIcon } from "@/components/icons";
import { Spinner } from "@/components/ui";
import type { Chat } from "@/lib/types";

export default function ChatListPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/chats")
      .then((r) => r.json())
      .then((d) => setChats(d.chats ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <main className="screen screen-wide py-4">
      <header className="flex items-center gap-2">
        <LogoMark size={22} />
        <h1 className="font-display text-xl font-semibold">Chat</h1>
      </header>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <SearchIcon size={18} className="text-[var(--color-muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Contacts..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-[var(--color-muted)]">
          <Spinner />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--color-border)]">
          {filtered.map((c) => (
            <li key={c._id}>
              <Link
                href={`/chat/${c._id}`}
                className="flex items-center gap-3 py-3.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{c.name}</p>
                    <span className="shrink-0 text-xs text-[var(--color-muted)]">
                      {c.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm ${
                        c.lastMessage
                          ? "text-[var(--color-muted)]"
                          : "text-[var(--color-faint)] italic"
                      }`}
                    >
                      {c.lastMessage || "Tap to start a conversation"}
                    </p>
                    {c.unread > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-xs font-semibold text-[#231310]">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
