"use client";

import { GoogleIcon, AppleIcon } from "./icons";

export function Divider({ label = "Or with" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-muted)]">
      <span className="h-px flex-1 bg-[var(--color-border)]" />
      {label}
      <span className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  );
}

export function SocialButtons({ verb = "Log In" }: { verb?: string }) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3.5 text-sm transition hover:bg-[var(--color-surface-2)]"
      >
        <GoogleIcon size={18} />
        {verb} With Google
      </button>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3.5 text-sm transition hover:bg-[var(--color-surface-2)]"
      >
        <AppleIcon size={18} />
        {verb} With Apple
      </button>
    </div>
  );
}
