"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoWord } from "@/components/Logo";
import { Button, Field, Input, ErrorText } from "@/components/ui";
import { SocialButtons, Divider } from "@/components/SocialButtons";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setUser(data.user);
      router.push("/home");
      router.refresh();
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
        <h1 className="font-display text-3xl font-semibold">Log In</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-muted)]">
          Enter to a Jiva Space Account to start discover a bunch of Live Spaces
          waiting for you.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Your Email">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Your Password">
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="123@!#"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <div className="flex justify-start">
          <Link
            href="/forgot-password"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Forget Password
          </Link>
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={loading}>
          Login
        </Button>
      </form>

      <Divider />
      <SocialButtons verb="Log In" />

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--color-accent)]">
          Sign Up
        </Link>
      </p>
    </main>
  );
}
