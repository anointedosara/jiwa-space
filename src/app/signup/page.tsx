"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoWord } from "@/components/Logo";
import { Button, Field, Input, ErrorText } from "@/components/ui";
import { SocialButtons, Divider } from "@/components/SocialButtons";
import { useAuth } from "@/components/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      setUser(data.user);
      if (data.devCode) {
        try {
          sessionStorage.setItem("jiva_devcode", data.devCode);
        } catch {}
      }
      router.push("/verify");
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

      <div className="mt-5 text-center">
        <h1 className="font-display text-3xl font-semibold">Sign Up</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-muted)]">
          Create a Jiva Space Account to start discover a bunch of Live Spaces
          waiting for you.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Your Name">
          <Input
            placeholder="Hasbi Kinclaid"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
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
            placeholder="123@!#"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Field label="Re-Enter Password">
          <Input
            type="password"
            placeholder="123@!#"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </Field>

        <p className="text-sm text-[var(--color-muted)]">
          Already Has An Account?{" "}
          <Link href="/login" className="text-[var(--color-accent)]">
            Log In
          </Link>
        </p>

        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={loading}>
          Sign Up
        </Button>
      </form>

      <Divider />
      <SocialButtons verb="Sign In" />
    </main>
  );
}
