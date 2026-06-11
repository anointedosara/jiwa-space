"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoWord } from "@/components/Logo";
import { Button, ErrorText } from "@/components/ui";

export default function VerifyPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devCode, setDevCode] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    try {
      setDevCode(sessionStorage.getItem("jiva_devcode") || "");
    } catch {}
  }, []);

  async function resend() {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend", { method: "POST" });
      const data = await res.json();
      if (data.devCode) {
        setDevCode(data.devCode);
        try {
          sessionStorage.setItem("jiva_devcode", data.devCode);
        } catch {}
      }
    } finally {
      setResending(false);
    }
  }

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = clean;
      return next;
    });
    if (clean && i < 3) inputs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function onContinue() {
    const code = digits.join("");
    if (code.length < 4) {
      setError("Enter all 4 digits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      router.push("/success?next=/home&title=Success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen screen-narrow flex flex-1 flex-col py-6">
      <div className="flex justify-center">
        <LogoWord size={18} markSize={22} />
      </div>

      <div className="mt-6 text-center">
        <h1 className="font-display text-3xl font-semibold">Verification Code</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-muted)]">
          Enter the 4 Digit Verification code that has been sent to your Email.
        </p>
      </div>

      {devCode && (
        <div className="mt-5 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-4 py-3 text-center text-sm">
          <span className="text-[var(--color-muted)]">
            Demo mode (no mail server) — your code is{" "}
          </span>
          <button
            type="button"
            onClick={() => setDigits(devCode.split(""))}
            className="font-semibold tracking-widest text-[var(--color-accent)] underline"
          >
            {devCode}
          </button>
        </div>
      )}

      <div className="mt-9 flex justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            className="h-16 w-16 rounded-xl border border-[var(--color-accent)]/50 bg-[var(--color-surface)] text-center text-2xl font-semibold outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        ))}
      </div>

      <div className="mt-8">
        <ErrorText>{error}</ErrorText>
      </div>

      <div className="mt-4 space-y-3">
        <Button onClick={onContinue} loading={loading}>
          Continue
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Didnt Receive A Code?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="text-[var(--color-accent)] disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend"}
        </button>
      </p>
    </main>
  );
}
