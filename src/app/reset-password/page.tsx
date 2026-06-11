"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoWord } from "@/components/Logo";
import { Button, Field, Input, ErrorText } from "@/components/ui";
import { ChevronLeft } from "@/components/icons";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      router.replace(
        "/success?next=/login&title=" +
          encodeURIComponent("Password Reset") +
          "&subtitle=" +
          encodeURIComponent("Your password has been updated. Please log in.")
      );
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
        <h1 className="font-display text-3xl font-semibold">Reset Password</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-muted)]">
          Enter the code we sent you and choose a new password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Your Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
          />
        </Field>
        <Field label="Reset Code">
          <Input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="1234"
            required
          />
        </Field>
        <Field label="New Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
        </Field>
        <Field label="Re-Enter Password">
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="123@!#"
            required
          />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={loading}>
          Reset Password
        </Button>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}
