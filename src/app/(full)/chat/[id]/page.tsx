"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, SendIcon } from "@/components/icons";
import { Spinner } from "@/components/ui";
import type { Chat, ChatMessage } from "@/lib/types";

export default function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/chats/${id}`)
      .then((r) => r.json())
      .then((d) => setChat(d.chat ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || !chat) return;
    setSending(true);
    const optimistic: ChatMessage = { from: "me", text: value, time: "now" };
    setChat({ ...chat, messages: [...chat.messages, optimistic] });
    setText("");
    try {
      await fetch(`/api/chats/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--color-muted)]">
        <Spinner />
      </div>
    );
  }
  if (!chat) {
    return (
      <div className="screen screen-narrow py-10 text-center text-[var(--color-muted)]">
        Conversation not found.
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="screen screen-wide flex items-center gap-3 border-b border-[var(--color-border)] py-3">
        <button onClick={() => router.back()} aria-label="Back" className="text-[var(--color-text)]">
          <ChevronLeft />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={chat.avatar} alt={chat.name} className="h-10 w-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold leading-tight">{chat.name}</p>
          <p className="text-xs text-[var(--color-accent)]">Online</p>
        </div>
      </header>

      <div className="screen screen-wide flex-1 space-y-3 overflow-y-auto py-4">
        {chat.messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-[var(--color-muted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={chat.avatar}
              alt={chat.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <p className="mt-3 font-medium text-[var(--color-text)]">{chat.name}</p>
            <p className="mt-1 text-sm">Say hello 👋 — start the conversation.</p>
          </div>
        )}
        {chat.messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "me"
                  ? "bg-[var(--color-accent)] text-[#231310]"
                  : "bg-[var(--color-surface)] text-[var(--color-text)]"
              }`}
            >
              {m.text}
              <span
                className={`mt-1 block text-[10px] ${
                  m.from === "me" ? "text-[#231310]/60" : "text-[var(--color-muted)]"
                }`}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={send}
        className="screen screen-wide sticky bottom-0 flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/95 py-3 backdrop-blur"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="submit"
          disabled={sending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-accent)] text-[#231310] disabled:opacity-60"
          aria-label="Send"
        >
          <SendIcon size={20} />
        </button>
      </form>
    </main>
  );
}
