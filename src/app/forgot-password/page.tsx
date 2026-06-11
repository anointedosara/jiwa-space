"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoWord } from "@/components/Logo";
import { Button, Field, Input, ErrorText } from "@/components/ui";
import { ChevronLeft } from "@/components/icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.devCode) setDevCode(data.devCode);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen screen-narrow flex flex-1 flex-col py-6">
      <div className="flex items-center">
        <button onClick={() => router.back()} aria-label="Back" className="text-[var(--color-accent)]">
          <ChevronLeft />
        </button>
        <div className="flex flex-1 justify-center pr-6">
          <LogoWord size={18} markSize={22} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <h1 className="font-display text-3xl font-semibold">Forget Password</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-muted)]">
          Forgot your password? just enter your Email and we&apos;ll sent you a
          password recovery link.
        </p>
      </div>

      {!sent ? (
        <form onSubmit={onSend} className="mt-8 flex flex-1 flex-col">
          <Field label="Your Email">
            <Input
              type="email"
              inputMode="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <div className="mt-4">
            <ErrorText>{error}</ErrorText>
          </div>
          <div className="mt-auto py-6">
            <Button type="submit" loading={loading}>
              Send
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-10 flex flex-1 flex-col items-center text-center">
          <div className="grid h-28 w-28 place-items-center rounded-3xl bg-[var(--color-accent)] text-[#231310]">
            <EnvelopeLock />
          </div>
          <p className="mt-6 max-w-xs text-sm text-[var(--color-muted)]">
            We have sent an email to{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {email}
            </span>{" "}
            with instructions to reset your password.
          </p>
          {devCode && (
            <p className="mt-4 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-4 py-3 text-sm">
              <span className="text-[var(--color-muted)]">
                Demo mode (no mail server) — your reset code is{" "}
              </span>
              <span className="font-semibold tracking-widest text-[var(--color-accent)]">
                {devCode}
              </span>
            </p>
          )}
          <div className="mt-auto w-full space-y-3 py-6">
            <Button
              onClick={() =>
                router.push(`/reset-password?email=${encodeURIComponent(email)}`)
              }
            >
              Reset Password
            </Button>
            <Button variant="outline" onClick={() => router.push("/login")}>
              Back to Login
            </Button>
          </div>
        </div>
      )}

      <p className="pb-2 text-center text-xs text-[var(--color-faint)]">
        By Using Jiva Space, you agree to the{" "}
        <span className="text-[var(--color-text)]">Terms</span> and{" "}
        <span className="text-[var(--color-text)]">Privacy Policy</span>
      </p>
    </main>
  );
}

function EnvelopeLock() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="m3 7 9 6 9-6" />
      <rect x="9" y="10" width="6" height="5" rx="1" fill="currentColor" stroke="none" />
      <path d="M10.5 10V9a1.5 1.5 0 0 1 3 0v1" />
    </svg>
  );
}
